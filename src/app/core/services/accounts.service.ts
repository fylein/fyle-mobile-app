import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
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
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private readonly accountDisplayNameMapping: Record<string, string> = {
    PERSONAL_CASH_ACCOUNT: 'services.accounts.personalCardCash',
    PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT: 'services.accounts.corporateCard',
    PERSONAL_ADVANCE_ACCOUNT: 'services.accounts.advanceWallet',
    COMPANY_ACCOUNT: 'services.accounts.paidByCompany',
  };

  constructor(
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private fyCurrencyPipe: FyCurrencyPipe,
    private translocoService: TranslocoService
  ) {}

  @Cacheable()
  getMyAccounts(): Observable<PlatformAccount[]> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformAccount[]>>('/accounts')
      .pipe(map((response: PlatformApiResponse<PlatformAccount[]>) => response.data));
  }

  // Filter user accounts by allowed payment modes and return an observable of allowed accounts
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getPaymentModesWithAdvanceWallets(
    accounts: PlatformAccount[],
    advanceWallets: AdvanceWallet[],
    allowedPaymentModes: string[],
    config: {
      etxn: Partial<UnflattenedTransaction>;
      expenseType: ExpenseType;
    }
  ): AccountOption[] {
    const { etxn, expenseType } = config;
    const isMileageOrPerDiemExpense = [ExpenseType.MILEAGE, ExpenseType.PER_DIEM].includes(expenseType);
    const userAccounts = accounts.filter((account) => [AccountType.PERSONAL, AccountType.CCC].includes(account.type));

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
      label: account.displayName,
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
    accounts: PlatformAccount[],
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
      label: account.displayName,
      value: account,
    }));
  }

  getAccountTypeFromPaymentMode(paymentMode: PlatformAccount | AdvanceWallet): AccountType {
    if (
      (paymentMode as PlatformAccount).type === AccountType.PERSONAL &&
      !(paymentMode as PlatformAccount).isReimbursable
    ) {
      return AccountType.COMPANY;
    }
    return (paymentMode as PlatformAccount).type;
  }

  getEtxnSelectedPaymentMode(
    etxn: Partial<UnflattenedTransaction>,
    paymentModes: AccountOption[]
  ): PlatformAccount | AdvanceWallet {
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
    account: PlatformAccount,
    paymentMode: string,
    isMultipleAdvanceEnabled?: boolean
  ): PlatformAccount {
    const accountCopy = cloneDeep(account);
    if (accountCopy) {
      if (paymentMode === AccountType.PERSONAL) {
        accountCopy.isReimbursable = true;
        accountCopy.displayName = this.translocoService.translate('services.accounts.personalCardCash');
      } else if (paymentMode === AccountType.COMPANY) {
        accountCopy.isReimbursable = false;
        accountCopy.displayName = this.translocoService.translate('services.accounts.paidByCompany');
      } else if (account.type === AccountType.CCC) {
        accountCopy.isReimbursable = false;
        accountCopy.displayName = this.translocoService.translate('services.accounts.corporateCard');
      } else if (account.type === AccountType.ADVANCE) {
        accountCopy.isReimbursable = false;
        accountCopy.displayName = this.getAdvanceAccountDisplayName(accountCopy, isMultipleAdvanceEnabled);
      } else {
        accountCopy.isReimbursable = false;
        accountCopy.displayName = account.type;
      }
    }
    return accountCopy;
  }

  getAdvanceWalletDisplayName(advanceWallet: AdvanceWallet): string {
    return this.translocoService.translate('services.accounts.advanceWalletDisplayName', {
      balance: this.fyCurrencyPipe.transform(advanceWallet.balance_amount, advanceWallet.currency),
    });
  }

  getAdvanceAccountDisplayName(account: PlatformAccount, isMultipleAdvanceEnabled: boolean): string {
    let accountCurrency = account.currency;
    let accountBalance = account.tentative_balance_amount;
    if (isMultipleAdvanceEnabled && account.current_balance_amount) {
      accountCurrency = account.currency;
      accountBalance = account.tentative_balance_amount;
    }
    return this.translocoService.translate('services.accounts.advanceAccountDisplayName', {
      balance: this.fyCurrencyPipe.transform(accountBalance, accountCurrency),
    });
  }

  filterAccountsWithSufficientBalance(accounts: PlatformAccount[], isAdvanceEnabled: boolean): PlatformAccount[] {
    return accounts.filter(
      (account) =>
        account &&
        // Personal Account and CCC account are considered to always have sufficient funds
        ((isAdvanceEnabled && account.tentative_balance_amount > 0) ||
          [AccountType.PERSONAL, AccountType.CCC].indexOf(account.type) > -1)
    );
  }

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getAllowedAccounts(
    allAccounts: PlatformAccount[],
    allowedPaymentModes: string[],
    isMultipleAdvanceEnabled: boolean,
    etxn?: Partial<UnflattenedTransaction>,
    isMileageOrPerDiemExpense = false
  ): PlatformAccount[] {
    const filteredPaymentModes = this.handlePaymentModeFiltering(allowedPaymentModes, isMileageOrPerDiemExpense, etxn);

    return this.processAccountsByPaymentMode(allAccounts, filteredPaymentModes, isMultipleAdvanceEnabled);
  }

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  getAllowedAccountsWithAdvanceWallets(
    allAccounts: PlatformAccount[],
    allowedPaymentModes: string[],
    etxn?: Partial<UnflattenedTransaction>,
    isMileageOrPerDiemExpense = false
  ): PlatformAccount[] {
    const filteredPaymentModes = this.handlePaymentModeFiltering(allowedPaymentModes, isMileageOrPerDiemExpense, etxn);

    return this.processAccountsByPaymentMode(allAccounts, filteredPaymentModes);
  }

  // `Paid by Company` and `Paid by Employee` have same account id so explicitly checking for them.
  checkIfEtxnHasSamePaymentMode(
    etxn: Partial<UnflattenedTransaction>,
    paymentMode: PlatformAccount | AdvanceWallet
  ): boolean {
    if (etxn.source.account_type === AccountType.PERSONAL && !etxn.tx.advance_wallet_id) {
      return (
        (paymentMode as PlatformAccount).id === etxn.tx.source_account_id &&
        (paymentMode as PlatformAccount).isReimbursable !== etxn.tx.skip_reimbursement
      );
    } else if (etxn.tx.id && etxn.tx.advance_wallet_id) {
      return (paymentMode as AdvanceWallet).id === etxn.tx.advance_wallet_id;
    }
    return (paymentMode as PlatformAccount).id === etxn.tx.source_account_id;
  }

  private handlePaymentModeFiltering(
    allowedPaymentModes: string[],
    isMileageOrPerDiemExpense: boolean,
    etxn?: Partial<UnflattenedTransaction>
  ): string[] {
    let updatedModes = [...allowedPaymentModes];

    // Check if only CCC is allowed BEFORE filtering
    const isOnlyCCCAllowed = updatedModes.length === 1 && updatedModes[0] === AccountType.CCC;

    // Mileage and per diem expenses cannot have PCCC as a payment mode
    if (isMileageOrPerDiemExpense) {
      updatedModes = updatedModes.filter((mode) => mode !== AccountType.CCC);
    }

    // Only add PERSONAL_CASH_ACCOUNT as fallback if no payment mode configurations are set
    // OR if only CCC was allowed but got filtered out for mileage/per diem expenses
    if ((!isOnlyCCCAllowed && !updatedModes.includes(AccountType.PERSONAL) && allowedPaymentModes.length === 0) ||
        (isOnlyCCCAllowed && isMileageOrPerDiemExpense && !updatedModes.includes(AccountType.PERSONAL))) {
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
    allAccounts: PlatformAccount[],
    allowedPaymentModes: string[],
    isMultipleAdvanceEnabled?: boolean
  ): PlatformAccount[] {
    const isOnlyCCCAllowed = allowedPaymentModes.length === 1 && allowedPaymentModes[0] === AccountType.CCC;

    return allowedPaymentModes
      .map((allowedPaymentMode) => {
        let accountsForPaymentMode: PlatformAccount[] = [];

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
}
