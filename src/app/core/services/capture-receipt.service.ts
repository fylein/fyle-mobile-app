import { Injectable } from '@angular/core';
import { forkJoin, from, Observable } from 'rxjs';
import { concatMap, filter, map, reduce, switchMap } from 'rxjs/operators';
import { ExtendedAccount } from '../models/extended-account.model';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { AccountsService } from './accounts.service';
import { NetworkService } from './network.service';
import { OfflineService } from './offline.service';
import { TransactionsOutboxService } from './transactions-outbox.service';

type Image = Partial<{
  source: string;
  base64Image: string;
}>;

@Injectable({
  providedIn: 'root',
})
export class CaptureReceiptService {
  constructor(
    private networkService: NetworkService,
    private offlineService: OfflineService,
    private accountsService: AccountsService,
    private transactionsOutboxService: TransactionsOutboxService
  ) {}

  addMultipleExpensesToQueue(base64ImagesWithSource: Image[], homeCurrency: string, isInstafyleEnabled: boolean) {
    return from(base64ImagesWithSource).pipe(
      concatMap((image: Image) => this.addExpenseToQueue(image, homeCurrency, isInstafyleEnabled)),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  getAccount(
    orgSettings: any,
    accounts: ExtendedAccount[],
    orgUserSettings: OrgUserSettings
  ): Observable<ExtendedAccount> {
    const isAdvanceEnabled = orgSettings?.advances?.enabled || orgSettings?.advance_requests?.enabled;

    const userAccounts = this.accountsService.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);
    const isMultipleAdvanceEnabled = orgSettings?.advance_account_settings?.multiple_accounts;

    return this.accountsService.constructPaymentModes(userAccounts, isMultipleAdvanceEnabled).pipe(
      map((paymentModes) => {
        const isCCCEnabled =
          orgSettings?.corporate_credit_card_settings?.allowed && orgSettings?.corporate_credit_card_settings?.enabled;

        const paidByCompanyAccount = paymentModes.find(
          (paymentMode) => paymentMode?.acc.displayName === 'Paid by Company'
        );

        let account;

        if (orgUserSettings.preferences?.default_payment_mode === 'COMPANY_ACCOUNT' && paidByCompanyAccount) {
          account = paidByCompanyAccount;
        } else if (
          isCCCEnabled &&
          orgUserSettings.preferences?.default_payment_mode === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'
        ) {
          account = paymentModes.find(
            (paymentMode) => paymentMode?.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'
          );
        } else {
          account = paymentModes.find((paymentMode) => paymentMode?.acc.displayName === 'Personal Card/Cash');
        }
        return account;
      })
    );
  }

  addExpenseToQueue(
    base64ImagesWithSource: Image,
    homeCurrency: string,
    isInstafyleEnabled: boolean,
    syncImmediately = false
  ) {
    let source = base64ImagesWithSource.source;

    return forkJoin({
      isConnected: this.networkService.isOnline(),
      orgUserSettings: this.offlineService.getOrgUserSettings(),
      accounts: this.offlineService.getAccounts(),
      orgSettings: this.offlineService.getOrgSettings(),
    }).pipe(
      switchMap(({ isConnected, orgUserSettings, accounts, orgSettings }) =>
        this.getAccount(orgSettings, accounts, orgUserSettings).pipe(
          filter((account) => !!account),
          switchMap((account) => {
            if (!isConnected) {
              source += '_OFFLINE';
            }
            const transaction = {
              source_account_id: account.acc.id,
              skip_reimbursement: !account.acc.isReimbursable || false,
              source,
              txn_dt: new Date(),
              currency: homeCurrency,
            };

            const attachmentUrls = [
              {
                thumbnail: base64ImagesWithSource.base64Image,
                type: 'image',
                url: base64ImagesWithSource.base64Image,
              },
            ];
            if (!syncImmediately) {
              return this.transactionsOutboxService.addEntry(
                transaction,
                attachmentUrls,
                null,
                null,
                isInstafyleEnabled
              );
            } else {
              return this.transactionsOutboxService.addEntryAndSync(transaction, attachmentUrls, null, null);
            }
          })
        )
      )
    );
  }
}
