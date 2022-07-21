import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { ApiService } from './api.service';
import { cloneDeep } from 'lodash';
import { LaunchDarklyService } from './launch-darkly.service';
import { Observable, of } from 'rxjs';
import { ExtendedAccount } from '../models/extended-account.model';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  constructor(
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private fyCurrencyPipe: FyCurrencyPipe,
    private launchDarklyService: LaunchDarklyService
  ) {}

  getEMyAccounts() {
    return this.apiService.get('/eaccounts/').pipe(
      map((accountsRaw: any[]) => {
        const accounts = [];

        accountsRaw.forEach((accountRaw) => {
          const account = this.dataTransformService.unflatten(accountRaw);
          accounts.push(account);
        });

        return accounts;
      })
    );
  }

  filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled, accountId?) {
    return accounts.filter(
      (account) =>
        // Personal Account and CCC account are considered to always have sufficient funds
        (isAdvanceEnabled && account.acc.tentative_balance_amount > 0) ||
        ['PERSONAL_ACCOUNT', 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'].indexOf(account.acc.type) > -1 ||
        accountId === account.acc.id
    );
  }

  constructPaymentModes(
    accounts: ExtendedAccount[],
    isMultipleAdvanceEnabled: boolean,
    isNotOwner?: boolean
  ): Observable<ExtendedAccount[]> {
    const that = this;

    const hidePaidByCompany$ = that.launchDarklyService.getVariation('hide_paid_by_company', false);

    return hidePaidByCompany$.pipe(
      map((hidePaidByCompany) => {
        const accountsMap = {
          PERSONAL_ACCOUNT(account: ExtendedAccount) {
            account.acc.displayName = 'Personal Card/Cash';
            if (isNotOwner) {
              account.acc.displayName = 'Paid by Employee';
            }
            account.acc.isReimbursable = true;
            return account;
          },
          PERSONAL_ADVANCE_ACCOUNT(account: ExtendedAccount) {
            let currency = account.currency;
            let balance = account.acc.tentative_balance_amount;
            if (isMultipleAdvanceEnabled && account.orig && account.orig.amount) {
              balance =
                (account.acc.tentative_balance_amount * account.orig.amount) / account.acc.current_balance_amount;
              currency = account.orig.currency;
            }

            account.acc.displayName = 'Advance (Balance: ' + that.fyCurrencyPipe.transform(balance, currency) + ')';

            account.acc.isReimbursable = false;
            return account;
          },
          PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT(account: ExtendedAccount) {
            account.acc.displayName = 'Corporate Card';
            account.acc.isReimbursable = false;
            return account;
          },
        };

        const mappedAccounts = accounts.map((account) => account && accountsMap[account.acc.type](account));

        if (!hidePaidByCompany) {
          const personalAccount = accounts.find((account) => account.acc.type === 'PERSONAL_ACCOUNT');
          if (personalAccount) {
            const personalNonreimbursableAccount = cloneDeep(personalAccount);
            personalNonreimbursableAccount.acc.displayName = 'Paid by Company';
            personalNonreimbursableAccount.acc.isReimbursable = false;
            mappedAccounts.push(personalNonreimbursableAccount);
          }
        }

        return mappedAccounts;
      })
    );
  }

  //Dummy method - will be replaced by API call
  getAllowedPaymentModes(): Observable<string[]> {
    return of(['PERSONAL_ACCOUNT', 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT']);
  }
}
