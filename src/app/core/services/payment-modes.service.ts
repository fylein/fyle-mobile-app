import { Injectable } from '@angular/core';
import { AccountsService } from './accounts.service';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { AccountType } from '../enums/account-type.enum';
import { ExtendedAccount } from '../models/extended-account.model';
import { EmployeeSettings } from '../models/employee-settings.model';
import { TrackingService } from '../../core/services/tracking.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { OrgSettings, PaymentmodeSettings } from '../models/org-settings.model';
import { AllowedPaymentModes } from '../models/allowed-payment-modes.enum';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
@Injectable({
  providedIn: 'root',
})
export class PaymentModesService {
  constructor(
    private accountsService: AccountsService,
    private platformEmployeeSettingsService: PlatformEmployeeSettingsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private trackingService: TrackingService
  ) {}

  checkIfPaymentModeConfigurationsIsEnabled(): Observable<boolean> {
    return this.platformEmployeeSettingsService
      .get()
      .pipe(
        map(
          (employeeSettings) =>
            employeeSettings.payment_mode_settings.allowed && employeeSettings.payment_mode_settings.enabled
        )
      );
  }

  getDefaultAccount(
    orgSettings: OrgSettings,
    accounts: ExtendedAccount[],
    employeeSettings: EmployeeSettings
  ): Observable<ExtendedAccount> {
    return forkJoin({
      allowedPaymentModes: this.platformEmployeeSettingsService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(({ allowedPaymentModes, isPaymentModeConfigurationsEnabled }) => {
        let defaultAccountType = AccountType.PERSONAL;

        if (isPaymentModeConfigurationsEnabled) {
          defaultAccountType = allowedPaymentModes[0];
        } else {
          const userDefaultPaymentMode = employeeSettings.default_payment_mode;
          const isCCCEnabled =
            orgSettings.corporate_credit_card_settings?.allowed && orgSettings.corporate_credit_card_settings?.enabled;
          if (isCCCEnabled && userDefaultPaymentMode === AccountType.CCC) {
            defaultAccountType = AccountType.CCC;
          } else if (employeeSettings.default_payment_mode === AccountType.COMPANY) {
            defaultAccountType = AccountType.COMPANY;
          }
        }

        const defaultAccount = accounts.find((account) => {
          /*
           * Accounts array does not have anything called COMPANY_ACCOUNT
           * We map PERSONAL_ACCOUNT to 'Peronsal Card/Cash' and 'Paid by Company' in the frontend
           * which happens in the setAccountProperties() method below
           */
          const mappedAccountType =
            defaultAccountType === AccountType.COMPANY ? AccountType.PERSONAL : defaultAccountType;
          return account.acc.type === mappedAccountType;
        });
        return this.accountsService.setAccountProperties(defaultAccount, defaultAccountType, false);
      })
    );
  }

  isNonReimbursableOrg(paymentModeSettings: PaymentmodeSettings): boolean {
    const paymentModesOrder = paymentModeSettings.payment_modes_order;

    if (paymentModesOrder?.length === 1) {
      return paymentModesOrder[0] === AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;
    }
    if (paymentModesOrder?.length === 2) {
      return (
        paymentModesOrder?.includes(AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT) &&
        paymentModesOrder?.includes(AllowedPaymentModes.COMPANY_ACCOUNT)
      );
    }
    return false;
  }

  showInvalidPaymentModeToast(): void {
    const message = 'Insufficient balance in the selected account. Please choose a different payment mode.';
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('failure', { message }),
      panelClass: ['msb-failure-with-report-btn'],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  getPaymentModeDisplayName(paymentMode: AllowedPaymentModes): string {
    switch (paymentMode) {
      case AllowedPaymentModes.PERSONAL_ADVANCE_ACCOUNT:
        return 'Personal Advances';
      case AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT:
        return 'Corporate Credit Card';
      default:
        return 'Personal Cash/Card';
    }
  }
}
