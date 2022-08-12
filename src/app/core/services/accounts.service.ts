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
import { AccountType } from 'src/app/core/enums/account-type.enum';

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
        [AccountType.PERSONAL, AccountType.CCC].indexOf(account.acc.type) > -1 ||
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
          const personalAccount = accounts.find((account) => account.acc.type === AccountType.PERSONAL);
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

  //Filter user accounts by allowed payment modes and return an observable of allowed accounts
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getPaymentModes(
    accounts: ExtendedAccount[],
    allowedPaymentModes: string[],
    orgSettings: any,
    etxn?: any,
    expenseType: 'EXPENSE' | 'MILEAGE' | 'PER_DIEM' = 'EXPENSE'
  ): Observable<AccountOption[]> {
    const isAdvanceEnabled = orgSettings?.advances?.enabled || orgSettings?.advance_requests?.enabled;
    const isMultipleAdvanceEnabled = orgSettings?.advance_account_settings?.multiple_accounts;
    const isMileageOrPerDiemExpense = ['MILEAGE', 'PER_DIEM'].includes(expenseType);

    const userAccounts = this.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);

    const allowedAccounts = this.getAllowedAccounts(
      userAccounts,
      allowedPaymentModes,
      isMultipleAdvanceEnabled,
      etxn,
      isMileageOrPerDiemExpense
    );

    return of(
      allowedAccounts.map((account) => ({
        label: account.acc.displayName,
        value: account,
      }))
    );
  }

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getAllowedAccounts(
    allAccounts: ExtendedAccount[],
    allowedPaymentModes: string[],
    isMultipleAdvanceEnabled: boolean,
    etxn?: any,
    isMileageOrPerDiemExpense = false
  ) {
    //Mileage and per diem expenses cannot have PCCC as a payment mode
    if (isMileageOrPerDiemExpense) {
      allowedPaymentModes = allowedPaymentModes.filter((allowedPaymentMode) => allowedPaymentMode !== AccountType.CCC);
    }

    //PERSONAL_ACCOUNT should always be present for mileage/per-diem or in case backend does not return any payment mode
    if (
      !allowedPaymentModes?.length ||
      (isMileageOrPerDiemExpense && !allowedPaymentModes.includes(AccountType.PERSONAL))
    ) {
      allowedPaymentModes = [AccountType.PERSONAL, ...allowedPaymentModes];
    }

    //Add current expense account to allowedPaymentModes if it is not present
    if (etxn?.source?.account_id) {
      let paymentModeOfExpense = etxn.source.account_type;
      if (etxn.source.account_type === AccountType.PERSONAL && etxn.tx.skip_reimbursement) {
        paymentModeOfExpense = AccountType.COMPANY;
      }
      if (!allowedPaymentModes.includes(paymentModeOfExpense)) {
        allowedPaymentModes = [paymentModeOfExpense, ...allowedPaymentModes];
      }
    }

    return allowedPaymentModes.map((allowedPaymentMode) => {
      const accountForPaymentMode = allAccounts.find((account) => {
        if (allowedPaymentMode === AccountType.COMPANY) {
          return account.acc.type === AccountType.PERSONAL;
        }
        return account.acc.type === allowedPaymentMode;
      });
      return this.setAccountProperties(accountForPaymentMode, allowedPaymentMode, isMultipleAdvanceEnabled);
    });
  }

  //`Paid by Company` and `Paid by Employee` have same account id so explicitly checking for them.
  checkIfEtxnHasSamePaymentMode(etxn: any, paymentMode: ExtendedAccount): boolean {
    if (etxn.source.account_type === AccountType.PERSONAL) {
      return (
        paymentMode.acc.id === etxn.tx.source_account_id &&
        paymentMode.acc.isReimbursable !== etxn.tx.skip_reimbursement
      );
    }
    return paymentMode.acc.id === etxn.tx.source_account_id;
  }

  getEtxnAccountType(etxn: Expense): string {
    if (etxn.source_account_type === AccountType.PERSONAL && etxn.tx_skip_reimbursement) {
      return AccountType.COMPANY;
    }
    return etxn.source_account_type;
  }

  getAccountTypeFromPaymentMode(paymentMode: ExtendedAccount) {
    if (paymentMode.acc.type === AccountType.PERSONAL && !paymentMode.acc.isReimbursable) {
      return AccountType.COMPANY;
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
      paymentMode === AccountType.ADVANCE
        ? this.getAdvanceAccountDisplayName(accountCopy, isMultipleAdvanceEnabled)
        : accountDisplayNameMapping[paymentMode];
    accountCopy.acc.isReimbursable = paymentMode === AccountType.PERSONAL;

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

  shouldPaymentModeBeShown(etxn: Expense, allowedPaymentModes: string[]) {
    if (allowedPaymentModes.length === 1) {
      const etxnAccountType = this.getEtxnAccountType(etxn);
      return allowedPaymentModes[0] !== etxnAccountType;
    }
    return true;
  }
}
