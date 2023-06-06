import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { ApiService } from './api.service';
import { cloneDeep } from 'lodash';
import { ExtendedAccount } from '../models/extended-account.model';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { Cacheable } from 'ts-cacheable';
import { AccountOption } from '../models/account-option.model';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { ExpenseType } from '../enums/expense-type.enum';
import { Observable } from 'rxjs';
import { UnflattenedTransaction } from '../models/unflattened-transaction.model';
import { OrgSettings } from '../models/org-settings.model';
import { DateService } from './date.service';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  constructor(
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private fyCurrencyPipe: FyCurrencyPipe,
    private dateService: DateService
  ) {}

  @Cacheable()
  getEMyAccounts(): Observable<ExtendedAccount[]> {
    return this.apiService.get<ExtendedAccount[]>('/eaccounts/').pipe(
      map((accountsRaw: ExtendedAccount[]) => {
        const accounts: ExtendedAccount[] = [];

        accountsRaw.forEach((accountRaw) => {
          const account = this.dataTransformService.unflatten(accountRaw) as ExtendedAccount;
          accounts.push(account);
        });

        return accounts;
      })
    );
  }

  // Filter user accounts by allowed payment modes and return an observable of allowed accounts
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getPaymentModes(
    accounts: ExtendedAccount[],
    allowedPaymentModes: string[],
    config: {
      etxn: Partial<UnflattenedTransaction>;
      orgSettings: OrgSettings;
      expenseType: ExpenseType;
    }
  ): AccountOption[] {
    const { etxn, orgSettings, expenseType } = config;
    const isAdvanceEnabled = orgSettings.advances.enabled || orgSettings.advance_requests.enabled;
    const isMultipleAdvanceEnabled = orgSettings.advance_account_settings.multiple_accounts;
    const isMileageOrPerDiemExpense = [ExpenseType.MILEAGE, ExpenseType.PER_DIEM].includes(expenseType);

    const userAccounts = this.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);

    const allowedAccounts = this.getAllowedAccounts(
      userAccounts,
      allowedPaymentModes,
      isMultipleAdvanceEnabled,
      etxn,
      isMileageOrPerDiemExpense
    );

    return allowedAccounts.map((account) => ({
      label: account.acc.displayName,
      value: account,
    }));
  }

  getAccountTypeFromPaymentMode(paymentMode: ExtendedAccount): AccountType {
    if (paymentMode.acc.type === AccountType.PERSONAL && !paymentMode.acc.isReimbursable) {
      return AccountType.COMPANY;
    }
    return paymentMode.acc.type;
  }

  getEtxnSelectedPaymentMode(etxn: UnflattenedTransaction, paymentModes: AccountOption[]): ExtendedAccount {
    if (etxn.tx.source_account_id) {
      return paymentModes
        .map((res) => res.value)
        .find((paymentMode) => this.checkIfEtxnHasSamePaymentMode(etxn, paymentMode));
    }
    return null;
  }

  // Add display name and isReimbursable properties to account object
  setAccountProperties(
    account: ExtendedAccount,
    paymentMode: string,
    isMultipleAdvanceEnabled: boolean
  ): ExtendedAccount {
    const accountDisplayNameMapping = {
      PERSONAL_ACCOUNT: 'Personal Card/Cash',
      COMPANY_ACCOUNT: 'Paid by Company',
      PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT: 'Corporate Card',
    };

    const accountCopy = cloneDeep(account);
    if (accountCopy) {
      accountCopy.acc.displayName =
        paymentMode === AccountType.ADVANCE
          ? this.getAdvanceAccountDisplayName(accountCopy, isMultipleAdvanceEnabled)
          : (accountDisplayNameMapping[paymentMode] as string);
      accountCopy.acc.isReimbursable = paymentMode === AccountType.PERSONAL;
    }

    return accountCopy;
  }

  getAdvanceAccountDisplayName(account: ExtendedAccount, isMultipleAdvanceEnabled: boolean): string {
    let accountCurrency = account.currency;
    let accountBalance = account.acc.tentative_balance_amount;
    if (isMultipleAdvanceEnabled && account.orig?.amount) {
      accountCurrency = account.orig.currency;
      accountBalance =
        (account.acc.tentative_balance_amount * account.orig.amount) / account.acc.current_balance_amount;
    }
    return 'Advance (Balance: ' + this.fyCurrencyPipe.transform(accountBalance, accountCurrency) + ')';
  }

  filterAccountsWithSufficientBalance(accounts: ExtendedAccount[], isAdvanceEnabled: boolean): ExtendedAccount[] {
    return accounts.filter(
      (account) =>
        // Personal Account and CCC account are considered to always have sufficient funds
        (isAdvanceEnabled && account.acc.tentative_balance_amount > 0) ||
        [AccountType.PERSONAL, AccountType.CCC].indexOf(account.acc.type) > -1
    );
  }

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getAllowedAccounts(
    allAccounts: ExtendedAccount[],
    allowedPaymentModes: string[],
    isMultipleAdvanceEnabled: boolean,
    etxn?: Partial<UnflattenedTransaction>,
    isMileageOrPerDiemExpense = false
  ): ExtendedAccount[] {
    //Mileage and per diem expenses cannot have PCCC as a payment mode
    if (isMileageOrPerDiemExpense) {
      allowedPaymentModes = allowedPaymentModes.filter((allowedPaymentMode) => allowedPaymentMode !== AccountType.CCC);
    }

    //PERSONAL_ACCOUNT should always be present for mileage/per-diem or in case backend does not return any payment mode
    if (
      !allowedPaymentModes.length ||
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

    return allowedPaymentModes
      .map((allowedPaymentMode) => {
        const accountsForPaymentMode = allAccounts.filter((account) => {
          if (allowedPaymentMode === AccountType.COMPANY) {
            return account.acc.type === AccountType.PERSONAL;
          }
          return account.acc.type === allowedPaymentMode;
        });

        //There can be multiple accounts of type PERSONAL_ADVANCE_ACCOUNT
        const accountsWithRenamedProperties = accountsForPaymentMode.map((accountForPaymentMode) =>
          this.setAccountProperties(accountForPaymentMode, allowedPaymentMode, isMultipleAdvanceEnabled)
        );
        return accountsWithRenamedProperties;
      })
      .reduce((allowedAccounts, accountsForPaymentMode) => [...allowedAccounts, ...accountsForPaymentMode]);
  }

  // `Paid by Company` and `Paid by Employee` have same account id so explicitly checking for them.
  checkIfEtxnHasSamePaymentMode(etxn: UnflattenedTransaction, paymentMode: ExtendedAccount): boolean {
    if (etxn.source.account_type === AccountType.PERSONAL) {
      return (
        paymentMode.acc.id === etxn.tx.source_account_id &&
        paymentMode.acc.isReimbursable !== etxn.tx.skip_reimbursement
      );
    }
    return paymentMode.acc.id === etxn.tx.source_account_id;
  }
}
