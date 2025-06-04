import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { AccountType } from '../enums/account-type.enum';
import { ExpenseType } from '../enums/expense-type.enum';
import {
  account1Data,
  account2Data,
  etxnObjData,
  etxnObjWithAdvanceWalletSource,
  etxnObjWithAdvSourceData,
  etxnObjWithSourceData,
  multipleAdvAccountsData,
  multiplePaymentModesData,
  multiplePaymentModesIncPersonalAccData,
  multiplePaymentModesWithCompanyAccData,
  multiplePaymentModesWithoutAdvData,
  multiplePaymentModesWithoutCCCAccData,
  multiplePaymentModesWithoutPersonalAccData,
  orgSettingsAdvDisabledData,
  orgSettingsData,
  paymentModeDataAdvance,
  paymentModeDataCCC,
  paymentModeDataCCCWithoutAccountProperty,
  paymentModeDataMultipleAdvance,
  paymentModeDataMultipleAdvWithoutOrigAmt,
  paymentModeDataPersonal,
  paymentModeDataPersonal2,
  paymentModesAccountsData,
  paymentModesData,
  paymentModesResData,
  unflattenedAccount1Data,
  unflattenedAccount2Data,
  unflattenedAccount3Data,
  unflattenedAccount4Data,
  unflattenedTransactionCCC,
  unflattenedTransactionPersonal,
  unflattenedTxnWithoutSourceAccountIdData,
  advanceWallet1Data,
  advanceWallet1DataZeroBalance,
  paymentModesWithAdvanceWalletsResData,
  paymentModesWithZeroAdvanceWalletBalanceResData,
  unflattenedTransactionAdvanceWallet,
  paymentModeDataAdvanceWallet,
  paymentModesWithAdvanceWalletsTestData,
} from '../test-data/accounts.service.spec.data';
import { AccountsService } from './accounts.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

const accountsCallResponse1 = [account1Data, account2Data];

fdescribe('AccountsService', () => {
  let accountsService: AccountsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let fyCurrencyPipe: jasmine.SpyObj<FyCurrencyPipe>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);

    TestBed.configureTestingModule({
      providers: [
        AccountsService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: FyCurrencyPipe,
          useValue: fyCurrencyPipeSpy,
        },
      ],
    });

    accountsService = TestBed.inject(AccountsService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    fyCurrencyPipe = TestBed.inject(FyCurrencyPipe) as jasmine.SpyObj<FyCurrencyPipe>;
  });

  it('should be created', () => {
    expect(accountsService).toBeTruthy();
  });

  it('should be able to fetch data from api in proper format', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: accountsCallResponse1 }));

    accountsService.getEMyAccounts().subscribe((res) => {
      expect(res[0]).toEqual(unflattenedAccount1Data);
      expect(res[1]).toEqual(unflattenedAccount2Data);
      expect(res.length === 2);
      done();
    });
  });

  it('should be able to check if etxn has same payment mode', () => {
    const mutableTransaction = { ...unflattenedTransactionCCC };
    const mutablePaymentMode = {
      ...paymentModeDataCCC,
      id: unflattenedTransactionCCC.tx.source_account_id,
      type: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
    };
    expect(accountsService.checkIfEtxnHasSamePaymentMode(mutableTransaction, mutablePaymentMode)).toBeTrue();
  });

  it('should be able to check if etxn has same personal account payment mode', () => {
    const mutableTransaction = { ...unflattenedTransactionPersonal };
    const mutablePaymentMode1 = {
      ...paymentModeDataPersonal,
      id: unflattenedTransactionPersonal.tx.source_account_id,
      type: 'PERSONAL_CASH_ACCOUNT',
      isReimbursable: true,
    };
    const mutablePaymentMode2 = {
      ...paymentModeDataPersonal2,
      id: unflattenedTransactionPersonal.tx.source_account_id,
      type: 'PERSONAL_CASH_ACCOUNT',
      isReimbursable: true,
    };

    expect(accountsService.checkIfEtxnHasSamePaymentMode(mutableTransaction, mutablePaymentMode1)).toBeTrue();
    expect(accountsService.checkIfEtxnHasSamePaymentMode(mutableTransaction, mutablePaymentMode2)).toBeTrue();
  });

  it('should be able to get etxn selected payment mode with source account id', () => {
    expect(accountsService.getEtxnSelectedPaymentMode(unflattenedTransactionCCC, paymentModesData)).toEqual(
      paymentModeDataCCC
    );
  });

  it('should be able to get etxn selected payment mode with advance wallet id', () => {
    expect(
      accountsService.getEtxnSelectedPaymentMode(
        unflattenedTransactionAdvanceWallet,
        paymentModesWithAdvanceWalletsResData
      )
    ).toEqual(paymentModeDataAdvanceWallet);
  });

  it('should be able to get selected payment mode as null when extn is without source account id', () => {
    expect(
      accountsService.getEtxnSelectedPaymentMode(unflattenedTxnWithoutSourceAccountIdData, paymentModesData)
    ).toBeNull();
  });

  it('should be able to get account type from payment mode', () => {
    expect(accountsService.getAccountTypeFromPaymentMode(paymentModeDataCCC)).toEqual(AccountType.CCC);
  });

  it('should be able to get company account type from payment mode', () => {
    expect(accountsService.getAccountTypeFromPaymentMode(paymentModeDataPersonal)).toEqual(AccountType.COMPANY);
  });

  it('should be able to set account properties', () => {
    const result = accountsService.setAccountProperties(paymentModeDataCCCWithoutAccountProperty, AccountType.CCC);
    expect(result.isReimbursable).toBeFalse();
    expect(result.acc.isReimbursable).toBeFalse();
  });

  it('should be able to set account properties for advance account', () => {
    const result = accountsService.setAccountProperties(unflattenedAccount2Data, AccountType.ADVANCE);
    expect(result.acc).toBeDefined();
    expect(result.acc.isReimbursable).toBeFalse();
  });

  it('should be able to set account properties for multiple advance account', () => {
    const result = accountsService.setAccountProperties(unflattenedAccount3Data, AccountType.ADVANCE);
    expect(result.acc).toBeDefined();
    expect(result.acc.isReimbursable).toBeFalse();
  });

  it('should be able to set account properties for multiple advance account as default without account', () => {
    expect(accountsService.setAccountProperties(null, AccountType.ADVANCE)).toBeNull();
  });

  it('should be able to set account properties for multiple advance account as default without orig amount', () => {
    const result = accountsService.setAccountProperties(unflattenedAccount4Data, AccountType.ADVANCE);
    expect(result.acc).toBeDefined();
    expect(result.acc.isReimbursable).toBeFalse();
  });

  it('should be able to filter the accounts with sufficient balance', () => {
    expect(accountsService.filterAccountsWithSufficientBalance(multiplePaymentModesData, true)).toEqual(
      multiplePaymentModesData
    );
  });

  it('should be able to get allowed accounts', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    const result = accountsService.getAllowedAccounts(
      multiplePaymentModesWithoutAdvData,
      allowedPaymentModes,
      false,
      etxnObjData,
      false
    );
    expect(result.length).toBe(2);
    expect(result[0].isReimbursable).toBeFalse();
    expect(result[1].isReimbursable).toBeFalse();
  });

  it('should be able to get allowed accounts with source in etxn obj', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    const mutableAccounts = multiplePaymentModesWithoutAdvData.map((account) => ({
      ...account,
      acc: account.acc ? { ...account.acc } : undefined,
    }));
    const result = accountsService.getAllowedAccountsWithAdvanceWallets(
      mutableAccounts,
      allowedPaymentModes,
      etxnObjWithSourceData,
      false
    );
    expect(result.length).toBe(1);
    expect(result[0].acc.type).toBe('PERSONAL_CASH_ACCOUNT');
    expect(result[0].acc.displayName).toBe('Personal Card/Cash (Reimbursable)');
  });

  it('should be able to get allowed accounts without passing isMileageOrPerDiem param', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    const mutableAccounts = multiplePaymentModesWithoutAdvData.map((account) => {
      const mutableAcc = account.acc
        ? {
            ...account.acc,
            isReimbursable: false,
          }
        : undefined;
      return {
        ...account,
        acc: mutableAcc,
        isReimbursable: false,
      };
    });
    const result = accountsService.getAllowedAccountsWithAdvanceWallets(
      mutableAccounts,
      allowedPaymentModes,
      etxnObjData
    );
    expect(result.length).toBe(1);
    expect(result[0].acc.type).toBe('PERSONAL_CASH_ACCOUNT');
    expect(result[0].acc.displayName).toBe('Personal Card/Cash (Reimbursable)');
  });

  it('should be able to get allowed accounts for mileage and per diem', () => {
    const allowedPaymentModes = ['COMPANY_ACCOUNT'];
    const mutableAccounts = multiplePaymentModesWithoutAdvData.map((account) => ({
      ...account,
      acc: account.acc
        ? {
            ...account.acc,
            id: account.acc.id,
            type: account.acc.type,
            name: account.acc.name,
            displayName: account.acc.displayName,
            isReimbursable: account.acc.isReimbursable,
          }
        : undefined,
    }));
    const result = accountsService.getAllowedAccountsWithAdvanceWallets(
      mutableAccounts,
      allowedPaymentModes,
      etxnObjData,
      true
    );
    expect(result.length).toBe(1);
    expect(result[0].acc.type).toBe('PERSONAL_CASH_ACCOUNT');
    expect(result[0].acc.displayName).toBe('Personal Card/Cash (Reimbursable)');
  });

  it('should be able to get allowed accounts when current expense payment mode is not allowed', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'];
    const mutableAccounts = multiplePaymentModesWithoutPersonalAccData.map((account) => ({
      ...account,
      acc: account.acc ? { ...account.acc } : undefined,
    }));
    const result = accountsService.getAllowedAccountsWithAdvanceWallets(
      mutableAccounts,
      allowedPaymentModes,
      etxnObjWithSourceData,
      false
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].acc).toBeDefined();
    expect(result[0].acc.type).toBeDefined();
  });

  it('should be able to return allowed accounts with advance accounts', () => {
    const allowedPaymentModes = ['PERSONAL_ADVANCE_ACCOUNT'];
    const mutableAccounts = multipleAdvAccountsData.map((account) => ({
      ...account,
      acc: account.acc ? { ...account.acc } : undefined,
    }));
    const result = accountsService.getAllowedAccounts(
      mutableAccounts,
      allowedPaymentModes,
      true,
      etxnObjWithAdvSourceData,
      false
    );
    expect(result.length).toBe(2);
    expect(result[0].acc.type).toBe('PERSONAL_ADVANCE_ACCOUNT');
    expect(result[0].amount).toBe(23213);
    expect(result[1].acc.type).toBe('PERSONAL_ADVANCE_ACCOUNT');
    expect(result[1].amount).toBe(23213);
  });

  it('should be able to get payment modes', () => {
    fyCurrencyPipe.transform.and.returnValue('$223,146,386.93');
    const config = {
      etxn: etxnObjData,
      expenseType: ExpenseType.EXPENSE,
      isPaidByCompanyHidden: true,
      isPaymentModeConfigurationsEnabled: true,
      orgSettings: orgSettingsData,
    };
    const allowedPaymentModes = [
      'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
      'PERSONAL_ACCOUNT',
      'COMPANY_ACCOUNT',
      'PERSONAL_ADVANCE_ACCOUNT',
    ];
    const result = accountsService.getPaymentModes(paymentModesAccountsData, allowedPaymentModes, config);
    expect(result.length).toBe(3);
    expect(result[0].value.acc.type).toBe('PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
    expect(result[1].value.acc.type).toBe('PERSONAL_CASH_ACCOUNT');
    expect(result[2].value.acc.type).toBe('PERSONAL_ADVANCE_ACCOUNT');
  });

  it('should be able to get payment modes when advances is disabled and advance requests is enabled', () => {
    const config = {
      etxn: etxnObjData,
      expenseType: ExpenseType.EXPENSE,
      isPaidByCompanyHidden: true,
      isPaymentModeConfigurationsEnabled: true,
      orgSettings: orgSettingsAdvDisabledData,
    };
    const allowedPaymentModes = [
      'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
      'PERSONAL_ACCOUNT',
      'COMPANY_ACCOUNT',
      'PERSONAL_ADVANCE_ACCOUNT',
    ];
    const result = accountsService.getPaymentModes(paymentModesAccountsData, allowedPaymentModes, config);
    expect(result.length).toBe(3);
    expect(result[0].value.acc.type).toBe('PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
    expect(result[1].value.acc.type).toBe('PERSONAL_CASH_ACCOUNT');
    expect(result[2].value.acc.type).toBe('PERSONAL_ADVANCE_ACCOUNT');
  });

  it('should be able to get payment modes with advance wallets', () => {
    fyCurrencyPipe.transform.and.returnValue('$1500');
    const config = {
      etxn: etxnObjData,
      expenseType: ExpenseType.EXPENSE,
    };
    const allowedPaymentModes = [
      'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
      'PERSONAL_ACCOUNT',
      'COMPANY_ACCOUNT',
      'PERSONAL_ADVANCE_ACCOUNT',
    ];

    // Create mutable copies of the test data
    const mutableAccounts = paymentModesWithAdvanceWalletsTestData.map((account) => ({
      ...account,
      acc: account.acc
        ? {
            ...account.acc,
            isReimbursable: account.acc.isReimbursable,
          }
        : undefined,
    }));

    const result = accountsService.getPaymentModesWithAdvanceWallets(
      mutableAccounts,
      advanceWallet1Data,
      allowedPaymentModes,
      config
    );

    expect(result.length).toBe(3);
    expect(result[0].label).toBe('Paid by Company');
    expect(result[0].value.acc.type).toBe('PERSONAL_CASH_ACCOUNT');
    expect(result[1].label).toBe('Corporate Card');
    expect(result[1].value.acc.type).toBe('PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
    expect(result[2].label).toBe('Advance Wallet (Balance: $1500)');
    expect(result[2].value.type).toBe('PERSONAL_ADVANCE_ACCOUNT');
  });
});
