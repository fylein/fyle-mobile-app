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
} from '../test-data/accounts.service.spec.data';
import { AccountsService } from './accounts.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { ExtendedAccount } from '../models/extended-account.model';
import { cloneDeep } from 'lodash';

const accountsCallResponse1 = [account1Data, account2Data];

describe('AccountsService', () => {
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

    accountsService.getMyAccounts().subscribe((res) => {
      expect(res[0]).toEqual(unflattenedAccount1Data);
      expect(res[1]).toEqual(unflattenedAccount2Data);
      expect(res.length === 2);
      done();
    });
  });

  it('should be able to check if etxn has same payment mode', () => {
    expect(accountsService.checkIfEtxnHasSamePaymentMode(unflattenedTransactionCCC, paymentModeDataCCC)).toBeTrue();
  });

  it('should be able to check if etxn has same personal account payment mode', () => {
    expect(
      accountsService.checkIfEtxnHasSamePaymentMode(unflattenedTransactionPersonal, paymentModeDataPersonal)
    ).toBeFalse();

    expect(
      accountsService.checkIfEtxnHasSamePaymentMode(unflattenedTransactionPersonal, paymentModeDataPersonal2)
    ).toBeTrue();
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
    expect(accountsService.setAccountProperties(paymentModeDataCCCWithoutAccountProperty, AccountType.CCC)).toEqual(
      paymentModeDataCCC
    );
  });

  it('should be able to set account properties for advance account', () => {
    expect(accountsService.setAccountProperties(unflattenedAccount2Data, AccountType.ADVANCE)).toEqual(
      paymentModeDataAdvance
    );
  });

  it('should be able to set account properties for multiple advance account', () => {
    fyCurrencyPipe.transform.and.returnValue('$223,146,386.93');
    expect(accountsService.setAccountProperties(unflattenedAccount3Data, AccountType.ADVANCE)).toEqual(
      paymentModeDataMultipleAdvance
    );
  });

  it('should be able to set account properties for multiple advance account as default without account', () => {
    expect(accountsService.setAccountProperties(null, AccountType.ADVANCE)).toBeNull();
  });

  it('should be able to set account properties for multiple advance account as default without orig amount', () => {
    expect(accountsService.setAccountProperties(unflattenedAccount4Data, AccountType.ADVANCE)).toEqual(
      paymentModeDataMultipleAdvWithoutOrigAmt
    );
  });

  it('should be able to filter the accounts with sufficient balance', () => {
    expect(accountsService.filterAccountsWithSufficientBalance(multiplePaymentModesData, true)).toEqual(
      multiplePaymentModesData
    );
  });

  it('should be able to get allowed accounts', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(
        multiplePaymentModesWithoutAdvData,
        allowedPaymentModes,
        false,
        etxnObjData,
        false
      )
    ).toEqual(multiplePaymentModesWithCompanyAccData);
  });

  it('should be able to get allowed accounts with source in etxn obj', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(
        multiplePaymentModesWithoutAdvData,
        allowedPaymentModes,
        false,
        etxnObjWithSourceData,
        false
      )
    ).toEqual(multiplePaymentModesWithCompanyAccData);
  });

  it('should be able to get allowed accounts without passing isMileageOrPerDiem param', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(
        multiplePaymentModesWithCompanyAccData,
        allowedPaymentModes,
        etxnObjData
      )
    ).toEqual(multiplePaymentModesWithCompanyAccData);
  });

  it('should be able to get allowed accounts without passing etxn param', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(accountsService.getAllowedAccounts(multiplePaymentModesWithoutAdvData, allowedPaymentModes, false)).toEqual(
      multiplePaymentModesWithCompanyAccData
    );
  });

  it('should be able to get allowed accounts for mileage and per diem', () => {
    const allowedPaymentModes = ['COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(
        cloneDeep(multiplePaymentModesWithoutAdvData),
        allowedPaymentModes,
        false,
        etxnObjData,
        true
      )
    ).toEqual(multiplePaymentModesWithoutCCCAccData);
  });

  it('should be able to get allowed accounts when current expense payment mode is not allowed', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(
        multiplePaymentModesWithoutPersonalAccData,
        allowedPaymentModes,
        false,
        etxnObjWithSourceData,
        false
      )
    ).toEqual(multiplePaymentModesIncPersonalAccData);
  });

  it('should be able to return allowed accounts with advance accounts', () => {
    fyCurrencyPipe.transform.and.returnValue('$223,146,386.93');
    const allowedPaymentModes = ['PERSONAL_ADVANCE_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(
        multipleAdvAccountsData,
        allowedPaymentModes,
        true,
        etxnObjWithAdvSourceData,
        false
      )
    ).toEqual(multipleAdvAccountsData);
    expect(accountsService.getAdvanceAccountDisplayName(multipleAdvAccountsData[1], true)).toBe(
      'Advance (Balance: $223,146,386.93)'
    );
    expect(fyCurrencyPipe.transform).toHaveBeenCalledWith(223146386.93, 'USD');
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
    expect(accountsService.getPaymentModes(paymentModesAccountsData, allowedPaymentModes, config)).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          label: 'Corporate Card',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accYoo40xd0C1',
              name: 'Corporate Credit Card Account',
              type: AccountType.CCC,
              current_balance_amount: 107069.2181,
              tentative_balance_amount: -379832.039763,
              displayName: 'Corporate Card',
              isReimbursable: false,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 107069.2181,
            }),
            currency: 'USD',
            amount: 107069.2181,
            id: 'accYoo40xd0C1',
            type: AccountType.CCC,
            isReimbursable: false,
            balance_amount: 107069.2181,
          }),
        }),
        jasmine.objectContaining({
          label: 'Personal Card/Cash',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accWUsrRlinFb',
              name: 'Personal Account',
              type: AccountType.PERSONAL,
              current_balance_amount: 159640.246645,
              tentative_balance_amount: 159640.246645,
              displayName: 'Personal Card/Cash',
              isReimbursable: true,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 159640.246645,
            }),
            currency: 'USD',
            amount: 159640.246645,
            id: 'accWUsrRlinFb',
            type: AccountType.PERSONAL,
            isReimbursable: true,
            balance_amount: 159640.246645,
          }),
        }),
        jasmine.objectContaining({
          label: 'Paid by Company',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accWUsrRlinFb',
              name: 'Personal Account',
              type: AccountType.PERSONAL,
              current_balance_amount: 159640.246645,
              tentative_balance_amount: 159640.246645,
              displayName: 'Paid by Company',
              isReimbursable: false,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 159640.246645,
            }),
            currency: 'USD',
            amount: 159640.246645,
            id: 'accWUsrRlinFb',
            type: AccountType.PERSONAL,
            isReimbursable: false,
            balance_amount: 159640.246645,
          }),
        }),
      ])
    );
  });

  it('should be able to get payment modes when advances is disabled and advance requests is enabled', () => {
    fyCurrencyPipe.transform.and.returnValue('$223,146,386.93');
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

    expect(result).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          label: 'Corporate Card',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accYoo40xd0C1',
              name: 'Corporate Credit Card Account',
              type: AccountType.CCC,
              current_balance_amount: 107069.2181,
              tentative_balance_amount: -379832.039763,
              displayName: 'Corporate Card',
              isReimbursable: false,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 107069.2181,
            }),
            currency: 'USD',
            amount: 107069.2181,
            id: 'accYoo40xd0C1',
            type: AccountType.CCC,
            isReimbursable: false,
            balance_amount: 107069.2181,
          }),
        }),
        jasmine.objectContaining({
          label: 'Personal Card/Cash',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accWUsrRlinFb',
              name: 'Personal Account',
              type: AccountType.PERSONAL,
              current_balance_amount: 159640.246645,
              tentative_balance_amount: 159640.246645,
              displayName: 'Personal Card/Cash',
              isReimbursable: true,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 159640.246645,
            }),
            currency: 'USD',
            amount: 159640.246645,
            id: 'accWUsrRlinFb',
            type: AccountType.PERSONAL,
            isReimbursable: true,
            balance_amount: 159640.246645,
          }),
        }),
        jasmine.objectContaining({
          label: 'Paid by Company',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accWUsrRlinFb',
              name: 'Personal Account',
              type: AccountType.PERSONAL,
              current_balance_amount: 159640.246645,
              tentative_balance_amount: 159640.246645,
              displayName: 'Paid by Company',
              isReimbursable: false,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 159640.246645,
            }),
            currency: 'USD',
            amount: 159640.246645,
            id: 'accWUsrRlinFb',
            type: AccountType.PERSONAL,
            isReimbursable: false,
            balance_amount: 159640.246645,
          }),
        }),
      ])
    );
    expect(result.length).toBe(3);
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
    const result = accountsService.getPaymentModesWithAdvanceWallets(
      paymentModesAccountsData,
      advanceWallet1Data,
      allowedPaymentModes,
      config
    );

    // Check that the result array contains all expected payment modes without relying on order
    expect(result).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          label: 'Corporate Card',
          value: jasmine.objectContaining({
            type: AccountType.CCC,
          }),
        }),
        jasmine.objectContaining({
          label: 'Personal Card/Cash',
          value: jasmine.objectContaining({
            type: AccountType.PERSONAL,
            isReimbursable: true,
          }),
        }),
        jasmine.objectContaining({
          label: 'Paid by Company',
          value: jasmine.objectContaining({
            type: AccountType.PERSONAL,
            isReimbursable: false,
          }),
        }),
        jasmine.objectContaining({
          label: 'Advance Wallet (Balance: $1500)',
          value: jasmine.objectContaining({
            type: 'PERSONAL_ADVANCE_ACCOUNT',
            balance_amount: 1500,
          }),
        }),
      ])
    );

    // Verify the total number of payment modes
    expect(result.length).toBe(4);
    expect(fyCurrencyPipe.transform).toHaveBeenCalledWith(1500, 'USD');
  });

  it('should be able to get payment modes with advance wallets during edit expense when wallet balance is 0', () => {
    fyCurrencyPipe.transform.and.returnValue('$0');
    const config = {
      etxn: etxnObjWithAdvanceWalletSource,
      expenseType: ExpenseType.EXPENSE,
    };
    const allowedPaymentModes = [
      'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
      'PERSONAL_ACCOUNT',
      'COMPANY_ACCOUNT',
      'PERSONAL_ADVANCE_ACCOUNT',
    ];
    const result = accountsService.getPaymentModesWithAdvanceWallets(
      paymentModesAccountsData,
      advanceWallet1DataZeroBalance,
      allowedPaymentModes,
      config
    );

    // Check that the result array contains all expected payment modes without relying on order
    expect(result).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          label: 'Advance Wallet (Balance: $0)',
          value: jasmine.objectContaining({
            type: 'PERSONAL_ADVANCE_ACCOUNT',
            balance_amount: 0,
          }),
        }),
        jasmine.objectContaining({
          label: 'Corporate Card',
          value: jasmine.objectContaining({
            type: AccountType.CCC,
          }),
        }),
        jasmine.objectContaining({
          label: 'Personal Card/Cash',
          value: jasmine.objectContaining({
            type: AccountType.PERSONAL,
            isReimbursable: true,
          }),
        }),
        jasmine.objectContaining({
          label: 'Paid by Company',
          value: jasmine.objectContaining({
            type: AccountType.PERSONAL,
            isReimbursable: false,
          }),
        }),
      ])
    );

    // Verify the total number of payment modes
    expect(result.length).toBe(4);
    expect(fyCurrencyPipe.transform).toHaveBeenCalledWith(0, 'USD');
  });

  it('should be able to get payment modes without passing etxn param', () => {
    fyCurrencyPipe.transform.and.returnValue('$1500');
    const config = {
      etxn: null,
      expenseType: ExpenseType.EXPENSE,
    };
    const allowedPaymentModes = [
      'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
      'PERSONAL_ACCOUNT',
      'COMPANY_ACCOUNT',
      'PERSONAL_ADVANCE_ACCOUNT',
    ];
    expect(
      accountsService.getPaymentModesWithAdvanceWallets(
        paymentModesAccountsData,
        advanceWallet1Data,
        allowedPaymentModes,
        config
      )
    ).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          label: 'Corporate Card',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accYoo40xd0C1',
              name: 'Corporate Credit Card Account',
              type: AccountType.CCC,
              current_balance_amount: 107069.2181,
              tentative_balance_amount: -379832.039763,
              displayName: 'Corporate Card',
              isReimbursable: false,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 107069.2181,
            }),
            currency: 'USD',
            amount: 107069.2181,
            id: 'accYoo40xd0C1',
            type: AccountType.CCC,
            isReimbursable: false,
            balance_amount: 107069.2181,
          }),
        }),
        jasmine.objectContaining({
          label: 'Personal Card/Cash',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accWUsrRlinFb',
              name: 'Personal Account',
              type: AccountType.PERSONAL,
              current_balance_amount: 159640.246645,
              tentative_balance_amount: 159640.246645,
              displayName: 'Personal Card/Cash',
              isReimbursable: true,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 159640.246645,
            }),
            currency: 'USD',
            amount: 159640.246645,
            id: 'accWUsrRlinFb',
            type: AccountType.PERSONAL,
            isReimbursable: true,
            balance_amount: 159640.246645,
          }),
        }),
        jasmine.objectContaining({
          label: 'Paid by Company',
          value: jasmine.objectContaining({
            acc: jasmine.objectContaining({
              id: 'accWUsrRlinFb',
              name: 'Personal Account',
              type: AccountType.PERSONAL,
              current_balance_amount: 159640.246645,
              tentative_balance_amount: 159640.246645,
              displayName: 'Paid by Company',
              isReimbursable: false,
            }),
            orig: jasmine.objectContaining({
              currency: 'USD',
              amount: 159640.246645,
            }),
            currency: 'USD',
            amount: 159640.246645,
            id: 'accWUsrRlinFb',
            type: AccountType.PERSONAL,
            isReimbursable: false,
            balance_amount: 159640.246645,
          }),
        }),
        jasmine.objectContaining({
          label: 'Advance Wallet (Balance: $1500)',
          value: jasmine.objectContaining({
            type: 'PERSONAL_ADVANCE_ACCOUNT',
            balance_amount: 1500,
          }),
        }),
      ])
    );
    expect(fyCurrencyPipe.transform).toHaveBeenCalledWith(1500, 'USD');
  });

  it('should be able to get allowed accounts', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(
        multiplePaymentModesWithoutAdvData,
        allowedPaymentModes,
        etxnObjData,
        false
      )
    ).toEqual(multiplePaymentModesWithCompanyAccData);
  });

  it('should be able to get allowed accounts with source in etxn obj', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(
        multiplePaymentModesWithoutAdvData,
        allowedPaymentModes,
        etxnObjWithSourceData,
        false
      )
    ).toEqual(multiplePaymentModesWithCompanyAccData);
  });

  it('should be able to get allowed accounts without passing isMileageOrPerDiem param', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(
        multiplePaymentModesWithoutAdvData,
        allowedPaymentModes,
        etxnObjData
      )
    ).toEqual(multiplePaymentModesWithCompanyAccData);
  });

  it('should be able to get allowed accounts without passing etxn param', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(multiplePaymentModesWithoutAdvData, allowedPaymentModes)
    ).toEqual(multiplePaymentModesWithCompanyAccData);
  });

  it('should be able to get allowed accounts for mileage and per diem', () => {
    const allowedPaymentModes = ['COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(
        cloneDeep(multiplePaymentModesWithoutAdvData),
        allowedPaymentModes,
        etxnObjData,
        true
      )
    ).toEqual(multiplePaymentModesWithoutCCCAccData);
  });

  it('should be able to get allowed accounts when current expense payment mode is not allowed', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(
        multiplePaymentModesWithoutPersonalAccData,
        allowedPaymentModes,
        etxnObjWithSourceData,
        false
      )
    ).toEqual(multiplePaymentModesIncPersonalAccData);
  });
});
