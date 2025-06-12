import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
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
import { PlatformAccount } from '../models/platform-account.model';
import { AdvanceWallet } from 'src/app/core/models/platform/v1/advance-wallet.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { AccountDetail } from '../models/account-detail.model';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private readonly accountDisplayNameMapping: Record<string, string> = {
    PERSONAL_CASH_ACCOUNT: 'Personal Card/Cash',
    PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT: 'Corporate Card',
    PERSONAL_ADVANCE_ACCOUNT: 'Advance Wallet',
    COMPANY_ACCOUNT: 'Paid by Company',
  };

  constructor(
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private fyCurrencyPipe: FyCurrencyPipe
  ) {}

  @Cacheable()
  getMyAccounts(): Observable<ExtendedAccount[]> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformAccount[]>>('/accounts')
      .pipe(
        map((response: PlatformApiResponse<PlatformAccount[]>) =>
          response.data.map((platformAccount) => this.transformToExtendedAccount(platformAccount))
        )
      );
  }

  // Filter user accounts by allowed payment modes and return an observable of allowed accounts
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getPaymentModesWithAdvanceWallets(
    accounts: ExtendedAccount[],
    advanceWallets: AdvanceWallet[],
    allowedPaymentModes: string[],
    config: {
      etxn: Partial<UnflattenedTransaction>;
      expenseType: ExpenseType;
    }
  ): AccountOption[] {
    const { etxn, expenseType } = config;
    const isMileageOrPerDiemExpense = [ExpenseType.MILEAGE, ExpenseType.PER_DIEM].includes(expenseType);
    const userAccounts = accounts.filter((account) =>
      [AccountType.PERSONAL, AccountType.CCC].includes(account.acc.type)
    );

    const allowedAccounts = this.getAllowedAccountsWithAdvanceWallets(
      userAccounts,
      allowedPaymentModes,
      etxn,
      isMileageOrPerDiemExpense
    );

    let allowedAdvanceWallets: AdvanceWallet[] = [];
    if (allowedPaymentModes.includes(AccountType.ADVANCE)) {
      allowedAdvanceWallets = advanceWallets.filter(
        (advanceWallet) =>
          (etxn?.tx?.advance_wallet_id && etxn.tx.advance_wallet_id === advanceWallet.id) ||
          advanceWallet.balance_amount > 0
      );
    }

    const formattedAccounts = allowedAccounts.map((account) => ({
      label: account.acc.displayName,
      value: account,
    }));

    const formattedAdvanceWallets = allowedAdvanceWallets.map((advanceWallet) => {
      const formattedAdvanceWallet = {
        label: this.getAdvanceWalletDisplayName(advanceWallet),
        value: advanceWallet,
      };
      return formattedAdvanceWallet;
    });

    const finalPaymentModes = [...formattedAccounts, ...formattedAdvanceWallets];

    return finalPaymentModes;
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

  getAccountTypeFromPaymentMode(paymentMode: ExtendedAccount | AdvanceWallet): AccountType {
    if (
      (paymentMode as ExtendedAccount).acc.type === AccountType.PERSONAL &&
      !(paymentMode as ExtendedAccount).acc.isReimbursable
    ) {
      return AccountType.COMPANY;
    }
    return (paymentMode as ExtendedAccount).acc.type;
  }

  getEtxnSelectedPaymentMode(
    etxn: Partial<UnflattenedTransaction>,
    paymentModes: AccountOption[]
  ): ExtendedAccount | AdvanceWallet {
    if (etxn.tx.source_account_id) {
      return paymentModes
        .map((res) => res.value)
        .find((paymentMode) => this.checkIfEtxnHasSamePaymentMode(etxn, paymentMode));
    } else if (etxn.tx.advance_wallet_id) {
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
    isMultipleAdvanceEnabled?: boolean
  ): ExtendedAccount {
    const accountCopy = cloneDeep(account);
    if (accountCopy) {
      if (!accountCopy.acc) {
        accountCopy.acc = {} as unknown as AccountDetail;
      }
      if (paymentMode === AccountType.PERSONAL) {
        accountCopy.isReimbursable = true;
        accountCopy.acc.isReimbursable = true;
        accountCopy.acc.displayName = 'Personal Card/Cash';
      } else if (paymentMode === AccountType.COMPANY) {
        accountCopy.isReimbursable = false;
        accountCopy.acc.isReimbursable = false;
        accountCopy.acc.displayName = 'Paid by Company';
      } else if (account.type === AccountType.CCC) {
        accountCopy.isReimbursable = false;
        accountCopy.acc.isReimbursable = false;
        accountCopy.acc.displayName = 'Corporate Card';
      } else if (account.type === AccountType.ADVANCE) {
        accountCopy.isReimbursable = false;
        accountCopy.acc.isReimbursable = false;
        accountCopy.acc.displayName = this.getAdvanceAccountDisplayName(accountCopy, isMultipleAdvanceEnabled);
      } else {
        accountCopy.isReimbursable = false;
        accountCopy.acc.isReimbursable = false;
        accountCopy.acc.displayName = account.type;
      }
    }
    return accountCopy;
  }

  getAdvanceWalletDisplayName(advanceWallet: AdvanceWallet): string {
    return (
      'Advance Wallet (Balance: ' +
      this.fyCurrencyPipe.transform(advanceWallet.balance_amount, advanceWallet.currency) +
      ')'
    );
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
        account?.acc &&
        // Personal Account and CCC account are considered to always have sufficient funds
        ((isAdvanceEnabled && account.acc.tentative_balance_amount > 0) ||
          [AccountType.PERSONAL, AccountType.CCC].indexOf(account.acc.type) > -1)
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
    const filteredPaymentModes = this.handlePaymentModeFiltering(allowedPaymentModes, isMileageOrPerDiemExpense, etxn);

    const result = this.processAccountsByPaymentMode(allAccounts, filteredPaymentModes, isMultipleAdvanceEnabled);

    return this.ensureMinimumOneAccount(result, allAccounts);
  }

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getAllowedAccountsWithAdvanceWallets(
    allAccounts: ExtendedAccount[],
    allowedPaymentModes: string[],
    etxn?: Partial<UnflattenedTransaction>,
    isMileageOrPerDiemExpense = false
  ): ExtendedAccount[] {
    const filteredPaymentModes = this.handlePaymentModeFiltering(allowedPaymentModes, isMileageOrPerDiemExpense, etxn);

    const result = this.processAccountsByPaymentMode(allAccounts, filteredPaymentModes);

    return this.ensureMinimumOneAccount(result, allAccounts);
  }

  // `Paid by Company` and `Paid by Employee` have same account id so explicitly checking for them.
  checkIfEtxnHasSamePaymentMode(
    etxn: Partial<UnflattenedTransaction>,
    paymentMode: ExtendedAccount | AdvanceWallet
  ): boolean {
    if (etxn.source.account_type === AccountType.PERSONAL && !etxn.tx.advance_wallet_id) {
      return (
        (paymentMode as ExtendedAccount).acc.id === etxn.tx.source_account_id &&
        (paymentMode as ExtendedAccount).acc.isReimbursable !== etxn.tx.skip_reimbursement
      );
    } else if (etxn.tx.id && etxn.tx.advance_wallet_id) {
      return (paymentMode as AdvanceWallet).id === etxn.tx.advance_wallet_id;
    }
    return (paymentMode as ExtendedAccount).acc.id === etxn.tx.source_account_id;
  }

  private transformToExtendedAccount(platformAccount: PlatformAccount): ExtendedAccount {
    const isPersonalCashAccount = platformAccount.type === AccountType.PERSONAL;

    const transformedAccount: ExtendedAccount = {
      id: platformAccount.id,
      type: platformAccount.type,
      currency: platformAccount.currency,
      amount: platformAccount.current_balance_amount,
      balance_amount: platformAccount.current_balance_amount,
      created_at: platformAccount.created_at,
      updated_at: platformAccount.updated_at,
      org_id: platformAccount.org_id,
      user_id: platformAccount.user_id,
      isReimbursable: isPersonalCashAccount,
      acc: {
        id: platformAccount.id,
        type: platformAccount.type,
        currency: platformAccount.currency,
        current_balance_amount: platformAccount.current_balance_amount,
        tentative_balance_amount: platformAccount.tentative_balance_amount,
        displayName: isPersonalCashAccount
          ? 'Personal Card/Cash'
          : this.accountDisplayNameMapping[platformAccount.type],
        isReimbursable: isPersonalCashAccount,
        created_at: new Date(platformAccount.created_at),
        updated_at: new Date(platformAccount.updated_at),
        name: isPersonalCashAccount ? 'Personal Card/Cash' : this.accountDisplayNameMapping[platformAccount.type],
        category: platformAccount.category_id || '',
      },
      org: {
        id: platformAccount.org_id,
        domain: '',
      },
      advance: platformAccount.advance || {
        id: null,
        purpose: null,
        // eslint-disable-next-line id-blacklist
        number: null,
      },
      orig: {
        currency: platformAccount.currency,
        amount: platformAccount.current_balance_amount,
      },
    };
    return transformedAccount;
  }

  private handlePaymentModeFiltering(
    allowedPaymentModes: string[],
    isMileageOrPerDiemExpense: boolean,
    etxn?: Partial<UnflattenedTransaction>
  ): string[] {
    let updatedModes = [...allowedPaymentModes];

    // Mileage and per diem expenses cannot have PCCC as a payment mode
    if (isMileageOrPerDiemExpense) {
      updatedModes = updatedModes.filter((mode) => mode !== AccountType.CCC);
    }

    // Check if only CCC is allowed
    const isOnlyCCCAllowed = updatedModes.length === 1 && updatedModes[0] === AccountType.CCC;

    // Add PERSONAL_ACCOUNT if not present (unless only CCC is allowed)
    if (!isOnlyCCCAllowed && !updatedModes.includes(AccountType.PERSONAL)) {
      updatedModes.push(AccountType.PERSONAL);
    }

    // Add current expense account to allowedPaymentModes if it's not present
    if (etxn?.source?.account_id && !etxn?.tx?.advance_wallet_id) {
      let paymentModeOfExpense = etxn.source.account_type;
      if (etxn.source.account_type === AccountType.PERSONAL && etxn.tx.skip_reimbursement) {
        paymentModeOfExpense = AccountType.COMPANY;
      }
      if (!updatedModes.includes(paymentModeOfExpense)) {
        updatedModes.push(paymentModeOfExpense);
      }
    }

    return updatedModes;
  }

  private processAccountsByPaymentMode(
    allAccounts: ExtendedAccount[],
    allowedPaymentModes: string[],
    isMultipleAdvanceEnabled?: boolean
  ): ExtendedAccount[] {
    const isOnlyCCCAllowed = allowedPaymentModes.length === 1 && allowedPaymentModes[0] === AccountType.CCC;

    return allowedPaymentModes
      .map((allowedPaymentMode) => {
        let accountsForPaymentMode: ExtendedAccount[] = [];

        if (allowedPaymentMode === AccountType.PERSONAL && !isOnlyCCCAllowed) {
          accountsForPaymentMode = allAccounts
            .filter((account) => account.type === AccountType.PERSONAL)
            .map((account) => this.setAccountProperties(account, AccountType.PERSONAL));
        } else if (allowedPaymentMode === AccountType.COMPANY && !isOnlyCCCAllowed) {
          accountsForPaymentMode = allAccounts
            .filter((account) => account.type === AccountType.PERSONAL)
            .map((account) => this.setAccountProperties(account, AccountType.COMPANY));
        } else if (allowedPaymentMode === AccountType.CCC) {
          accountsForPaymentMode = allAccounts
            .filter((account) => account.type === AccountType.CCC)
            .map((account) => this.setAccountProperties(account, AccountType.CCC));
        } else {
          accountsForPaymentMode = allAccounts
            .filter((account) => account.type === allowedPaymentMode)
            .map((account) => this.setAccountProperties(account, allowedPaymentMode, isMultipleAdvanceEnabled));
        }

        return accountsForPaymentMode;
      })
      .reduce((acc, curr) => [...acc, ...curr], []);
  }

  private ensureMinimumOneAccount(result: ExtendedAccount[], allAccounts: ExtendedAccount[]): ExtendedAccount[] {
    if (result.length === 0 && allAccounts.length > 0) {
      const firstAccount = allAccounts[0];
      firstAccount.isReimbursable = true;
      if (!firstAccount.acc) {
        firstAccount.acc = {} as unknown as AccountDetail;
      }
      firstAccount.acc.isReimbursable = true;
      firstAccount.acc.displayName = 'Personal Card/Cash (Reimbursable)';
      return [firstAccount];
    }

    return result;
  }
}
