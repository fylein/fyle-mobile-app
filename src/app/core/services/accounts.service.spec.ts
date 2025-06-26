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
  multiplePaymentModesWithCompanyAccData2,
} from '../test-data/accounts.service.spec.data';
import { AccountsService } from './accounts.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { ExtendedAccount } from '../models/extended-account.model';
import { cloneDeep } from 'lodash';
import { TranslocoService } from '@jsverse/transloco';

const accountsCallResponse1 = [account1Data, account2Data];

describe('AccountsService', () => {
  let accountsService: AccountsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let fyCurrencyPipe: jasmine.SpyObj<FyCurrencyPipe>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string, params?: any) => {
      const translations: { [key: string]: string } = {
        'services.accounts.personalCardCash': 'Personal Card/Cash',
        'services.accounts.paidByCompany': 'Paid by Company',
        'services.accounts.corporateCard': 'Corporate Card',
        'services.accounts.advanceWallet': 'Advance Wallet',
        'services.accounts.advanceWalletDisplayName': 'Advance Wallet (Balance: {balance})',
        'services.accounts.advanceAccountDisplayName': 'Advance (Balance: {balance})',
      };

      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && params.balance !== undefined) {
        translation = translation.replace('{balance}', params.balance);
      } else if (params && params.balance === undefined) {
        translation = translation.replace('{balance}', 'undefined');
      }

      return translation;
    });

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
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });

    accountsService = TestBed.inject(AccountsService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    fyCurrencyPipe = TestBed.inject(FyCurrencyPipe) as jasmine.SpyObj<FyCurrencyPipe>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
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
    fyCurrencyPipe.transform.and.returnValue('$223,146,386.93');
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
    fyCurrencyPipe.transform.and.returnValue('$223,146,386.93');
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
    const allowedPaymentModes = [AccountType.CCC, AccountType.PERSONAL];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(
        multiplePaymentModesWithCompanyAccData,
        allowedPaymentModes,
        etxnObjData
      )
    ).toEqual(multiplePaymentModesWithCompanyAccData2);
  });

  it('should be able to get allowed accounts without passing etxn param', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(accountsService.getAllowedAccounts(multiplePaymentModesWithoutAdvData, allowedPaymentModes, false)).toEqual(
      multiplePaymentModesWithCompanyAccData
    );
  });

  it('should be able to get allowed accounts for mileage and per diem', () => {
    const allowedPaymentModes = [AccountType.CCC];
    expect(
      accountsService.getAllowedAccounts(
        multiplePaymentModesWithoutAdvData,
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
      paymentModesResData
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
    expect(accountsService.getPaymentModes(paymentModesAccountsData, allowedPaymentModes, config)).toEqual(
      paymentModesResData
    );
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
    expect(
      accountsService.getPaymentModesWithAdvanceWallets(
        paymentModesAccountsData,
        advanceWallet1Data,
        allowedPaymentModes,
        config
      )
    ).toEqual(paymentModesWithAdvanceWalletsResData);
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
    expect(
      accountsService.getPaymentModesWithAdvanceWallets(
        paymentModesAccountsData,
        advanceWallet1DataZeroBalance,
        allowedPaymentModes,
        config
      )
    ).toEqual(paymentModesWithZeroAdvanceWalletBalanceResData);
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
    ).toEqual(paymentModesWithAdvanceWalletsResData);
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
    const allowedPaymentModes = [AccountType.CCC, AccountType.COMPANY, AccountType.PERSONAL];
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
    const allowedPaymentModes = [AccountType.CCC];
    expect(
      accountsService.getAllowedAccountsWithAdvanceWallets(
        multiplePaymentModesWithoutAdvData,
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
