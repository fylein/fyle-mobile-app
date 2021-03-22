import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { ApiService } from './api.service';
import { cloneDeep } from 'lodash';
import { CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ExtendedAccount } from '../models/v1/extended-account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private currencyPipe: CurrencyPipe
  ) { }

  getEMyAccounts(filters?: { account_type?: string; non_zero?: boolean }): Observable<ExtendedAccount[]> {
    const data = {
      params: filters
    };

    return this.apiService.get('/eaccounts/', data).pipe(
      map(
        (accountsRaw: any[]) => {
          const accounts = [];

          accountsRaw.forEach((accountRaw) => {
            const account = this.dataTransformService.unflatten(accountRaw);
            accounts.push(account);
          });

          return accounts;
        }
      )
    );
  }

  filterAccountsWithSufficientBalance(accounts: ExtendedAccount[], isAdvanceEnabled: boolean, accountId?: string): ExtendedAccount[] {
    return accounts.filter((account) => {
      // Personal Account and CCC account are considered to always have sufficient funds
      return (isAdvanceEnabled && account.acc.tentative_balance_amount > 0) || (['PERSONAL_ACCOUNT', 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'].indexOf(account.acc.type) > -1) || accountId === account.acc.id;
    });
  }

  constructPaymentModes(accounts: ExtendedAccount[], isMultipleAdvanceEnabled: boolean, isNotOwner?: boolean): ExtendedAccount[] {
    const that = this;
    const accountsMap = {
      PERSONAL_ACCOUNT(account: ExtendedAccount) {
        account.acc.displayName = 'Paid by Me';
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
          balance = (account.acc.tentative_balance_amount * account.orig.amount) / account.acc.current_balance_amount;
          currency = account.orig.currency;
        }

        account.acc.displayName = 'Paid from Advance (Balance: ' + that.currencyPipe.transform(balance, currency) + ')';

        account.acc.isReimbursable = false;
        return account;
      },
      PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT(account: ExtendedAccount) {
        account.acc.displayName = 'Paid via Corporate Card';
        account.acc.isReimbursable = false;
        return account;
      }
    };

    const mappedAccouts =  accounts.map(account => accountsMap[account.acc.type](account));
    const personalAccount = accounts.find(account => account.acc.type === 'PERSONAL_ACCOUNT');
    if (personalAccount) {
      const personalNonreimbursableAccount = cloneDeep(personalAccount);
      personalNonreimbursableAccount.acc.displayName = 'Paid by Company';
      personalNonreimbursableAccount.acc.isReimbursable = false;
      mappedAccouts.push(personalNonreimbursableAccount);
    }

    return mappedAccouts;
  }
}
