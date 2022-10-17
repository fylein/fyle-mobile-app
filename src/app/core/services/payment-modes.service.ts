import { Injectable } from '@angular/core';
import { AccountsService } from './accounts.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { Expense } from '../models/expense.model';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { ExpenseType } from '../enums/expense-type.enum';
import { AccountType } from '../enums/account-type.enum';
import { ExtendedAccount } from '../models/extended-account.model';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { OrgUserSettingsService } from './org-user-settings.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentModesService {
  constructor(
    private accountsService: AccountsService,
    private launchDarklyService: LaunchDarklyService,
    private orgUserSettingsService: OrgUserSettingsService
  ) {}

  checkIfPaymentModeConfigurationsIsEnabled() {
    return forkJoin({
      isPaymentModeConfigurationsEnabled: this.launchDarklyService.checkIfPaymentModeConfigurationsIsEnabled(),
      orgUserSettings: this.orgUserSettingsService.get(),
    }).pipe(
      map(
        ({ isPaymentModeConfigurationsEnabled, orgUserSettings }) =>
          isPaymentModeConfigurationsEnabled &&
          orgUserSettings.payment_mode_settings.allowed &&
          orgUserSettings.payment_mode_settings.enabled
      )
    );
  }

  shouldPaymentModeBeShown(etxn: Expense, expenseType: ExpenseType): Observable<boolean> {
    return forkJoin({
      allowedPaymentModes: this.orgUserSettingsService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.checkIfPaymentModeConfigurationsIsEnabled(),
    }).pipe(
      map(({ allowedPaymentModes, isPaymentModeConfigurationsEnabled }) => {
        const isMileageOrPerDiemExpense = [ExpenseType.MILEAGE, ExpenseType.PER_DIEM].includes(expenseType);
        if (isMileageOrPerDiemExpense) {
          allowedPaymentModes = allowedPaymentModes.filter(
            (allowedPaymentMode) => allowedPaymentMode !== AccountType.CCC
          );

          /*
           * For mileage and per-diem expenses, since default payment mode is PERSONAL_ACCOUNT,
           * we don't show Payment Mode field if COMPANY_ACCOUNT and PERSONAL_ADVANCE_ACCOUNT
           * are not present
           */
          if (!allowedPaymentModes.length) {
            return false;
          }
        }
        if (isPaymentModeConfigurationsEnabled && allowedPaymentModes.length === 1) {
          const etxnAccountType = this.accountsService.getEtxnAccountType(etxn);
          return allowedPaymentModes[0] !== etxnAccountType;
        }
        return true;
      })
    );
  }

  getDefaultAccount(
    orgSettings: any,
    accounts: ExtendedAccount[],
    orgUserSettings: OrgUserSettings
  ): Observable<ExtendedAccount> {
    return forkJoin({
      allowedPaymentModes: this.orgUserSettingsService.getAllowedPaymentModes(),
      isPaymentModeConfigurationsEnabled: this.checkIfPaymentModeConfigurationsIsEnabled(),
      isPaidByCompanyHidden: this.launchDarklyService.checkIfPaidByCompanyIsHidden(),
    }).pipe(
      map(({ allowedPaymentModes, isPaymentModeConfigurationsEnabled, isPaidByCompanyHidden }) => {
        let defaultAccountType = AccountType.PERSONAL;

        if (isPaymentModeConfigurationsEnabled) {
          defaultAccountType = allowedPaymentModes[0];
        } else {
          const userDefaultPaymentMode = orgUserSettings.preferences?.default_payment_mode;
          const isCCCEnabled =
            orgSettings?.corporate_credit_card_settings?.allowed &&
            orgSettings?.corporate_credit_card_settings?.enabled;
          if (isCCCEnabled && userDefaultPaymentMode === AccountType.CCC) {
            defaultAccountType = AccountType.CCC;
          } else if (
            orgUserSettings.preferences?.default_payment_mode === AccountType.COMPANY &&
            !isPaidByCompanyHidden
          ) {
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
}
