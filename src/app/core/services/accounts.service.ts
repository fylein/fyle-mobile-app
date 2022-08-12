import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { ApiService } from './api.service';
import { cloneDeep } from 'lodash';
import { LaunchDarklyService } from './launch-darkly.service';
import { Observable, of } from 'rxjs';
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
    return of(['PERSONAL_ADVANCE_ACCOUNT', 'COMPANY_ACCOUNT']);
  }

  //Filter user accounts by allowed payment modes and return an observable of allowed accounts
  getPaymentModes(
    accounts: ExtendedAccount[],
    orgSettings: any,
    etxn?: any,
    expenseType = 'EXPENSE'
  ): Observable<AccountOption[]> {
    const isAdvanceEnabled = orgSettings?.advances?.enabled || orgSettings?.advance_requests?.enabled;
    const isMultipleAdvanceEnabled = orgSettings?.advance_account_settings?.multiple_accounts;
    const isMileageOrPerDiemExpense = ['MILEAGE', 'PER_DIEM'].includes(expenseType);

    //Mileage and Per Diem expenses cannot have CCC as a payment mode
    if (isMileageOrPerDiemExpense) {
      accounts = accounts.filter((account) =>
        ['PERSONAL_ACCOUNT', 'PERSONAL_ADVANCE_ACCOUNT'].includes(account.acc.type)
      );
    }
    const userAccounts = this.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);

    return this.getAllowedPaymentModes().pipe(
      map((allowedPaymentModes) => {
        let allowedAccounts = this.getAllowedAccounts(accounts, allowedPaymentModes, isMultipleAdvanceEnabled);

        if (etxn?.tx?.source_account_id) {
          allowedAccounts = this.addMissingAccount(
            etxn,
            accounts,
            allowedAccounts,
            isMultipleAdvanceEnabled,
            isMileageOrPerDiemExpense
          );
        }
        return allowedAccounts.map((account) => ({
          label: account.acc.displayName,
          value: account,
        }));
      })
    );
  }

  getAllowedAccounts(accounts: ExtendedAccount[], allowedPaymentModes: string[], isMultipleAdvanceEnabled: boolean) {
    return allowedPaymentModes.map((allowedPaymentMode) => {
      const accountForPaymentMode = accounts.find((account) => {
        if (allowedPaymentMode === 'COMPANY_ACCOUNT') {
          return account.acc.type === 'PERSONAL_ACCOUNT';
        }
        return account.acc.type === allowedPaymentMode;
      });
      return this.setAccountProperties(accountForPaymentMode, allowedPaymentMode, isMultipleAdvanceEnabled);
    });
  }

  /**
   * In edit expense, if the account selected while creating the expense is no longer present in
   * the list of allowed accounts, add it to the list only for this expense
   */
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  addMissingAccount(
    etxn: any,
    allAccounts: ExtendedAccount[],
    allowedAccounts: ExtendedAccount[],
    isMultipleAdvanceEnabled: boolean,
    isMileageOrPerDiemExpense: boolean
  ): ExtendedAccount[] {
    if (!allowedAccounts.some((account) => this.checkIfEtxnHasSamePaymentMode(etxn, account))) {
      let paymentModeOfExpense = allAccounts.find((account) => account.acc.id === etxn.tx.source_account_id);
      let accountTypeOfExpense = etxn.source.account_type;
      if (etxn.source.account_type === 'PERSONAL_ACCOUNT' && etxn.tx.skip_reimbursement) {
        accountTypeOfExpense = 'COMPANY_ACCOUNT';
      }
      paymentModeOfExpense = this.setAccountProperties(
        paymentModeOfExpense,
        accountTypeOfExpense,
        isMultipleAdvanceEnabled
      );
      return [paymentModeOfExpense, ...allowedAccounts];
    }

    /**
     * 'Personal Card/Cash' should always be present for mileage and per diem expenses
     * or if no payment mode is present
     */
    if (
      (isMileageOrPerDiemExpense &&
        !allowedAccounts.some(
          (paymentMode) => this.getAccountTypeFromPaymentMode(paymentMode) === 'PERSONAL_ACCOUNT'
        )) ||
      !allowedAccounts?.length
    ) {
      const personalAccount = allowedAccounts.find(
        (paymentMode) => this.getAccountTypeFromPaymentMode(paymentMode) === 'PERSONAL_ACCOUNT'
      );
      return [personalAccount, ...allowedAccounts];
    }
    return allowedAccounts;
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

  //Add display name and isReimbursable properties to account object
  setAccountProperties(account: ExtendedAccount, paymentMode: string, isMultipleAdvanceEnabled: boolean) {
    const accountDisplayNameMapping = {
      PERSONAL_ACCOUNT: 'Personal Card/Cash',
      COMPANY_ACCOUNT: 'Paid by Company',
      PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT: 'Corporate Card',
    };

    const accountCopy = cloneDeep(account);
    accountCopy.acc.displayName =
      paymentMode === 'PERSONAL_ADVANCE_ACCOUNT'
        ? this.getAdvanceAccountDisplayName(accountCopy, isMultipleAdvanceEnabled)
        : accountDisplayNameMapping[paymentMode];
    accountCopy.acc.isReimbursable = paymentMode === 'PERSONAL_ACCOUNT';

    return accountCopy;
  }

  getAdvanceAccountDisplayName(account: ExtendedAccount, isMultipleAdvanceEnabled: boolean) {
    let accountCurrency = account.currency;
    let accountBalance = account.acc.tentative_balance_amount;
    if (isMultipleAdvanceEnabled && account?.orig?.amount) {
      accountCurrency = account.orig.currency;
      accountBalance =
        (account.acc.tentative_balance_amount * account.orig.amount) / account.acc.current_balance_amount;
    }
    return 'Advance (Balance: ' + this.fyCurrencyPipe.transform(accountBalance, accountCurrency) + ')';
  }
}
