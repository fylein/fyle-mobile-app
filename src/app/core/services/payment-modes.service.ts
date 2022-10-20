import { Injectable } from '@angular/core';
import { AccountsService } from './accounts.service';
import { OfflineService } from './offline.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
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
    private offlineService: OfflineService,
    private launchDarklyService: LaunchDarklyService,
    private orgUserSettingsService: OrgUserSettingsService
  ) {}

  checkIfPaymentModeConfigurationsIsEnabled() {
    return forkJoin({
      isPaymentModeConfigurationsEnabled: this.launchDarklyService.checkIfPaymentModeConfigurationsIsEnabled(),
      orgUserSettings: this.offlineService.getOrgUserSettings(),
    }).pipe(
      map(
        ({ isPaymentModeConfigurationsEnabled, orgUserSettings }) =>
          isPaymentModeConfigurationsEnabled &&
          orgUserSettings.payment_mode_settings.allowed &&
          orgUserSettings.payment_mode_settings.enabled
      )
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
