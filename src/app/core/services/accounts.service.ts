import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { ApiService } from './api.service';
import { cloneDeep } from 'lodash';
import { LaunchDarklyService } from './launch-darkly.service';
import { Observable, of, forkJoin } from 'rxjs';
import { ExtendedAccount } from '../models/extended-account.model';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { AccountOption } from '../models/account-option.model';
import { Expense } from '../models/expense.model';

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
    return of(['COMPANY_ACCOUNT', 'PERSONAL_ADVANCE_ACCOUNT', 'PERSONAL_ACCOUNT']);
  }

  //Filter and sort user accounts by allowed payment modes and return an observable of allowed accounts
  getAllowedAccounts(etxn: any, accounts: ExtendedAccount[], orgSettings: any): Observable<AccountOption[]> {
    const isAdvanceEnabled = orgSettings?.advances?.enabled || orgSettings?.advance_requests?.enabled;
    const isMultipleAdvanceEnabled = orgSettings?.advance_account_settings?.multiple_accounts;
    const userAccounts = this.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);

    return forkJoin({
      constructedPaymentModes: this.constructPaymentModes(userAccounts, isMultipleAdvanceEnabled),
      allowedPaymentModes: this.getAllowedPaymentModes(),
    }).pipe(
      map(({ constructedPaymentModes, allowedPaymentModes }) => {
        //Filter out accounts not present in allowed payment modes array
        const filteredPaymentModes = constructedPaymentModes.filter((paymentMode) => {
          if (this.getAccountTypeFromPaymentMode(paymentMode) === 'COMPANY_ACCOUNT') {
            paymentMode.acc.type = 'COMPANY_ACCOUNT';
            return allowedPaymentModes.some((allowedpaymentMode) => allowedpaymentMode === 'COMPANY_ACCOUNT');
          }
          return allowedPaymentModes.some((allowedpaymentMode) => allowedpaymentMode === paymentMode.acc.type);
        });

        //In case no payment modes are present, show `Personal Card/Cash` as the payment mode
        // isMileageOrPerDiemExpense = ['MILEAGE', 'PER_DIEM'].includes()

        if (!filteredPaymentModes?.length) {
          return [
            {
              label: 'PERSONAL_ACCOUNT',
              value: constructedPaymentModes.find((paymentMode) => {
                const accountType = this.getAccountTypeFromPaymentMode(paymentMode);
                return accountType === 'PERSONAL_ACCOUNT';
              }),
            },
          ];
        }

        const sortedPaymentModes = this.sortBasedOnAllowedPaymentModes(allowedPaymentModes, filteredPaymentModes);
        const userPaymentModes = this.addMissingAccount(etxn, constructedPaymentModes, sortedPaymentModes);

        return userPaymentModes.map((paymentMode) => {
          if (paymentMode.acc.type === 'COMPANY_ACCOUNT') {
            paymentMode.acc.type = 'PERSONAL_ACCOUNT';
          }
          return { label: paymentMode.acc.displayName, value: paymentMode };
        });
      })
    );
  }

  sortBasedOnAllowedPaymentModes(allowedPaymentModes: string[], paymentModes: ExtendedAccount[]): ExtendedAccount[] {
    return paymentModes.sort(
      (a, b) => allowedPaymentModes.indexOf(a.acc.type) - allowedPaymentModes.indexOf(b.acc.type)
    );
  }

  /**
   * In edit expense, if the account selected while creating the expense is no longer present in
   * the list of allowed accounts, add it to the list only for this expense
   */
  addMissingAccount(
    etxn: any,
    allPaymentModes: ExtendedAccount[],
    allowedPaymentModes: ExtendedAccount[]
  ): ExtendedAccount[] {
    if (
      etxn.tx.source_account_id &&
      !allowedPaymentModes.some((paymentMode) => this.checkIfEtxnHasSamePaymentMode(etxn, paymentMode))
    ) {
      const accountLinkedWithExpense = allPaymentModes.find((paymentMode) =>
        this.checkIfEtxnHasSamePaymentMode(etxn, paymentMode)
      );
      return [accountLinkedWithExpense, ...allowedPaymentModes];
    }
    return allowedPaymentModes;
  }

  //`Paid by Company` and `Paid by Employee` have same account id so explicitly checking for them.
  checkIfEtxnHasSamePaymentMode(etxn: any, paymentMode: ExtendedAccount): boolean {
    if (etxn.source.account_type === 'PERSONAL_ACCOUNT') {
      return (
        paymentMode.acc.id === etxn.tx.source_account_id &&
        paymentMode.acc.isReimbursable !== etxn.tx.skip_reimbursement
      );
    }
    return paymentMode.acc.id === etxn.tx.source_account_id;
  }

  getEtxnAccountType(etxn: Expense): string {
    if (etxn.source_account_type === 'PERSONAL_ACCOUNT' && etxn.tx_skip_reimbursement) {
      return 'COMPANY_ACCOUNT';
    }
    return etxn.source_account_type;
  }

  getAccountTypeFromPaymentMode(paymentMode: ExtendedAccount) {
    if (paymentMode.acc.type === 'PERSONAL_ACCOUNT' && !paymentMode.acc.isReimbursable) {
      return 'COMPANY_ACCOUNT';
    }
    return paymentMode.acc.type;
  }

  getEtxnSelectedPaymentMode(etxn: any, paymentModes: AccountOption[]) {
    if (etxn.tx.source_account_id) {
      return paymentModes
        .map((res) => res.value)
        .find((paymentMode) => this.checkIfEtxnHasSamePaymentMode(etxn, paymentMode));
    }
    return null;
  }
}
