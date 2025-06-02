import { Injectable } from '@angular/core';
import { AccountsService } from './accounts.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { AccountType } from '../enums/account-type.enum';
import { ExtendedAccount } from '../models/extended-account.model';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TrackingService } from '../../core/services/tracking.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { OrgSettings, PaymentmodeSettings } from '../models/org-settings.model';
import { AllowedPaymentModes } from '../models/allowed-payment-modes.enum';
@Injectable({
  providedIn: 'root',
})
export class PaymentModesService {
  constructor(
    private accountsService: AccountsService,
    private launchDarklyService: LaunchDarklyService,
    private orgUserSettingsService: OrgUserSettingsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private trackingService: TrackingService
  ) {}

  checkIfPaymentModeConfigurationsIsEnabled(): Observable<boolean> {
    return this.orgUserSettingsService
      .get()
      .pipe(
        map(
          (orgUserSettings) =>
            orgUserSettings.payment_mode_settings.allowed && orgUserSettings.payment_mode_settings.enabled
        )
      );
  }

  getDefaultAccount(
    orgSettings: OrgSettings,
    accounts: ExtendedAccount[],
    orgUserSettings: OrgUserSettings
  ): Observable<ExtendedAccount> {
    return forkJoin({
      allowedPaymentModes: this.orgUserSettingsService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(({ allowedPaymentModes, isPaymentModeConfigurationsEnabled }) => {
        const defaultAccountType = this.determineDefaultAccountType(
          orgSettings,
          orgUserSettings,
          allowedPaymentModes,
          isPaymentModeConfigurationsEnabled
        );

        return this.findAndTransformDefaultAccount(accounts, defaultAccountType);
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

  private determineDefaultAccountType(
    orgSettings: OrgSettings,
    orgUserSettings: OrgUserSettings,
    allowedPaymentModes: AccountType[],
    isPaymentModeConfigurationsEnabled: boolean
  ): AccountType {
    if (isPaymentModeConfigurationsEnabled) {
      return this.getAccountTypeFromOrgSettings(orgSettings, allowedPaymentModes);
    } else {
      return this.getAccountTypeFromUserPreferences(orgSettings, orgUserSettings);
    }
  }

  private getAccountTypeFromOrgSettings(orgSettings: OrgSettings, allowedPaymentModes: AccountType[]): AccountType {
    if (orgSettings.payment_mode_settings?.payment_modes_order?.length > 0) {
      const orgDefaultMode = orgSettings.payment_mode_settings.payment_modes_order[0];
      switch (orgDefaultMode) {
        case AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT:
          return AccountType.CCC;
        case AllowedPaymentModes.COMPANY_ACCOUNT:
          return AccountType.COMPANY;
        case AllowedPaymentModes.PERSONAL_ADVANCE_ACCOUNT:
          return AccountType.ADVANCE;
        default:
          return AccountType.PERSONAL;
      }
    }
    return allowedPaymentModes[0];
  }

  private getAccountTypeFromUserPreferences(orgSettings: OrgSettings, orgUserSettings: OrgUserSettings): AccountType {
    const userDefaultPaymentMode = orgUserSettings.preferences.default_payment_mode;
    const isCCCEnabled =
      orgSettings.corporate_credit_card_settings?.allowed && orgSettings.corporate_credit_card_settings?.enabled;

    if (isCCCEnabled && userDefaultPaymentMode === AccountType.CCC) {
      return AccountType.CCC;
    } else if (orgUserSettings.preferences?.default_payment_mode === AccountType.COMPANY) {
      return AccountType.COMPANY;
    }
    return AccountType.PERSONAL;
  }

  private findAndTransformDefaultAccount(
    accounts: ExtendedAccount[],
    defaultAccountType: AccountType
  ): ExtendedAccount | null {
    const mappedAccountType = defaultAccountType === AccountType.COMPANY ? AccountType.PERSONAL : defaultAccountType;

    const defaultAccount = accounts.find((account) => account.acc && account.acc.type === mappedAccountType);

    return defaultAccount ? this.accountsService.setAccountProperties(defaultAccount, defaultAccountType) : null;
  }
}
