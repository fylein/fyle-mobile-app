import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import {
  expenseData2,
  expenseData1,
  mileageExpenseWithDistance,
  mileageExpenseWithoutDistance,
  perDiemExpenseSingleNumDays,
  perDiemExpenseMultipleNumDays,
  apiExpenseRes,
  expenseList2,
  expenseList3,
  expenseList4,
} from '../mock-data/expense.data';

import { AccountsService } from './accounts.service';
import { ApiService } from './api.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { OrgSettingsService } from './org-settings.service';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
import { PaymentModesService } from './payment-modes.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { StorageService } from './storage.service';
import { TimezoneService } from './timezone.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';
import { UtilityService } from './utility.service';
import dayjs from 'dayjs';
import * as lodash from 'lodash';
import {
  transformedExpensePayload,
  txnData,
  txnData2,
  txnData4,
  txnDataCleaned,
  txnDataPayload,
  txnList,
  upsertTxnParam,
} from '../mock-data/transaction.data';
import { fileObjectData1 } from '../mock-data/file-object.data';
import { AccountType } from '../enums/account-type.enum';
import { orgSettingsData } from '../test-data/org-settings.service.spec.data';
import { accountsData } from '../test-data/accounts.service.spec.data';
import { currencySummaryData } from '../mock-data/currency-summary.data';
import { platformPolicyExpenseData1 } from '../mock-data/platform-policy-expense.data';
import { expensePolicyData } from '../mock-data/expense-policy.data';
import { txnAccountData, personalAccountData } from '../mock-data/txn-account.data';
import { txnCustomPropertiesData2, txnCustomPropertiesData6 } from '../mock-data/txn-custom-properties.data';
import { FilterQueryParams } from '../models/filter-query-params.model';
import {
  matchCCCExpenseResponseData,
  unmatchCCCExpenseResponseData,
} from '../mock-data/corporate-card-transaction-response.data';
import { cloneDeep } from 'lodash';
import { expensesCacheBuster$ } from '../cache-buster/expense-cache-buster';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { expenseData } from '../mock-data/platform/v1/expense.data';
import { TrackingService } from './tracking.service';
import { employeeSettingsData } from '../mock-data/employee-settings.data';
import { TranslocoService } from '@jsverse/transloco';
describe('TransactionService', () => {
  let transactionService: TransactionService;
  let storageService: jasmine.SpyObj<StorageService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: jasmine.SpyObj<DateService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let fileService: jasmine.SpyObj<FileService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let paymentModesService: jasmine.SpyObj<PaymentModesService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let accountsService: jasmine.SpyObj<AccountsService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'fixDates',
      'fixDatesV2',
      'getThisMonthRange',
      'getThisWeekRange',
      'getLastMonthRange',
      'getUTCMidAfternoonDate',
    ]);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
    const timezoneServiceSpy = jasmine.createSpyObj('TimezoneService', [
      'convertAllDatesToProperLocale',
      'convertToUtc',
      'convertToTimezone',
    ]);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['discardRedundantCharacters']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['post']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['clearTaskCache']);
    const paymentModesServiceSpy = jasmine.createSpyObj('PaymentModesService', ['getDefaultAccount']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const accountsServiceSpy = jasmine.createSpyObj('AccountsService', ['getMyAccounts']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['transformTo', 'post', 'createFromFile']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['patchExpensesError']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    translocoServiceSpy.translate.and.callFake((key: string, params?: any) => {
      const translations: { [key: string]: string } = {
        'services.transaction.days': 'Days',
        'services.transaction.day': 'Day',
        'services.transaction.deleteSingleExpenseMessage': 'You are about to permanently delete 1 selected expense.',
        'services.transaction.deleteMultipleExpensesMessage':
          'You are about to permanently delete {expenseCount} selected expenses.',
        'services.transaction.cccSingleExpenseWarning':
          "There is {cccExpenses} corporate card expense from the selection which can't be deleted.",
        'services.transaction.cccMultipleExpensesWarning':
          "There are {cccExpenses} corporate card expenses from the selection which can't be deleted.",
        'services.transaction.deleteOtherExpensesInfo': 'However you can delete the other expenses from the selection.',
        'services.transaction.actionCantBeReversed': "Once deleted, the action can't be reversed.",
        'services.transaction.confirmPermanentDelete':
          'Are you sure to <b>permanently</b> delete the selected expenses?',
        'services.transaction.splitExpenseRemovalInfo':
          'Since this is a split expense, clicking on <strong>Confirm</strong> will remove the card details from all the related split expenses.',
        'services.transaction.newExpenseCreationInfo':
          'A new expense will be created from the card expense removed here.',
        'services.transaction.confirmCardRemoval': 'Are you sure to remove your card expense from this expense?',
        'services.transaction.reimbursable': 'Reimbursable',
        'services.transaction.nonReimbursable': 'Non-Reimbursable',
        'services.transaction.advance': 'Advance',
        'services.transaction.ccc': 'CCC',
        'services.transaction.cccMessagePlural':
          "There are {cccExpenses} corporate card expenses from the selection which can't be deleted. However you can delete the other expenses from the selection.",
      };
      let translation = translations[key] || key;
      if (params) {
        if (params.cccExpenses !== undefined) {
          translation = translation.replace('{cccExpenses}', params.cccExpenses);
        }
        if (params.expenseCount !== undefined) {
          translation = translation.replace('{expenseCount}', params.expenseCount);
        }
      }
      return translation;
    });
    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
        },
        {
          provide: PaymentModesService,
          useValue: paymentModesServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: TimezoneService,
          useValue: timezoneServiceSpy,
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: AccountsService,
          useValue: accountsServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });

    transactionService = TestBed.inject(TransactionService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    timezoneService = TestBed.inject(TimezoneService) as jasmine.SpyObj<TimezoneService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(transactionService).toBeTruthy();
  });

  it('clearCache(): should clear cache', (done) => {
    const notifierSpy = spyOn(expensesCacheBuster$, 'next').and.callThrough();
    transactionService.clearCache().subscribe((res) => {
      expect(notifierSpy).toHaveBeenCalledTimes(1);
      expect(res).toBeNull();
      done();
    });
  });

  it('getDefaultVehicleType(): should get default vehicle type', (done) => {
    const defaultVehicleType = 'two_wheeler';
    storageService.get.and.resolveTo(defaultVehicleType);
    transactionService.getDefaultVehicleType().subscribe((res) => {
      expect(res).toEqual(defaultVehicleType);
      expect(storageService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getIsCriticalPolicyViolated():', () => {
    it('should return false if critical policy is not violated', () => {
      expect(transactionService.getIsCriticalPolicyViolated(expenseData1)).toBeFalse();
    });

    it('should return true if critical policy is violated', () => {
      expect(transactionService.getIsCriticalPolicyViolated(expenseData2)).toBeTrue();
    });
  });

  describe('getIsDraft():', () => {
    it('should return true if transaction is draft', () => {
      expect(transactionService.getIsDraft(expenseData1)).toBeTrue();
    });

    it('should return false if transaction is not draft', () => {
      expect(transactionService.getIsDraft(expenseData2)).toBeFalse();
    });
  });

  describe('getRemoveCardExpenseDialogBody():', () => {
    const dialogBodyWithSplitExpense = `<ul class="text-left">
    <li>Since this is a split expense, clicking on <strong>Confirm</strong> will remove the card details from all the related split expenses.</li>
    <li>A new expense will be created from the card expense removed here.</li>
    <li>Are you sure to remove your card expense from this expense?</li>
    </ul>`;

    const dialogBodyWithoutSplitExpense = `<ul class="text-left">
    <li>A new expense will be created from the card expense removed here.</li>
    <li>Are you sure to remove your card expense from this expense?</li>
    </ul>`;

    it('should return remove card expense dialog body with split expnese', () => {
      expect(transactionService.getRemoveCardExpenseDialogBody(true)).toEqual(dialogBodyWithSplitExpense);
    });

    it('should return remove card expense dialog body without split expnese', () => {
      expect(transactionService.getRemoveCardExpenseDialogBody(false)).toEqual(dialogBodyWithoutSplitExpense);
    });
  });

  it('removeCorporateCardExpense(): should remove corporate card expense', (done) => {
    const transactionID = 'tx7NU3Dviv4K';
    const mockResponse = {
      data: {
        user_created_expense: expenseData,
        auto_created_expense: expenseData,
      },
    };

    spenderPlatformV1ApiService.post.and.returnValue(of(mockResponse));

    transactionService.removeCorporateCardExpense(transactionID).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/expenses/unlink_card_transaction', {
        data: {
          id: transactionID,
        },
      });
      done();
    });
  });

  describe('generateReceiptAttachedParams():', () => {
    const params = { or: [] };
    beforeEach(() => {
      spyOn(lodash, 'cloneDeep').and.returnValue(params);
    });

    it('should return receipt attached params if receipt attached is YES', () => {
      const filters = { receiptsAttached: 'YES' };
      const receiptsAttachedParams = { or: [], tx_num_files: 'gt.0' };
      expect(transactionService.generateReceiptAttachedParams(params, filters)).toEqual(receiptsAttachedParams);
    });

    it('should return receipt attached params if receipt attached is NO', () => {
      const filters = { receiptsAttached: 'NO' };
      const receiptsAttachedParams = { or: [], tx_num_files: 'eq.0' };
      expect(transactionService.generateReceiptAttachedParams(params, filters)).toEqual(receiptsAttachedParams);
    });

    afterEach(() => {
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(params);
    });
  });

  describe('generateSplitExpenseParams():', () => {
    let params: FilterQueryParams;

    beforeEach(() => {
      params = { or: [] };
      spyOn(lodash, 'cloneDeep').and.returnValue(params);
    });

    it('should return split expense params if split expense is YES', () => {
      const filters = { splitExpense: 'YES' };
      const splitExpenseParams = { or: ['(tx_is_split_expense.eq.true)'] };
      expect(transactionService.generateSplitExpenseParams(params, filters)).toEqual(splitExpenseParams);
    });

    it('should return split expense params if split expense is NO', () => {
      const filters = { splitExpense: 'NO' };
      const splitExpenseParams = { or: ['(tx_is_split_expense.eq.false)'] };
      expect(transactionService.generateSplitExpenseParams(params, filters)).toEqual(splitExpenseParams);
    });

    afterEach(() => {
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(params);
    });
  });

  it('generateStateFilters(): should generate state filters', () => {
    const filters = { state: ['READY_TO_REPORT', 'POLICY_VIOLATED', 'CANNOT_REPORT', 'DRAFT'] };
    const params = { or: [] };
    const stateOrFilterRes = [
      '(and(tx_state.in.(COMPLETE),or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)), and(tx_policy_flag.eq.true,or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)), tx_policy_amount.lt.0.0001, tx_state.in.(DRAFT))',
    ];

    spyOn(lodash, 'cloneDeep').and.returnValue(params);
    // @ts-ignore
    spyOn(transactionService, 'generateStateOrFilter').and.returnValue(stateOrFilterRes);

    expect(transactionService.generateStateFilters(params, filters)).toEqual({
      or: [
        '((and(tx_state.in.(COMPLETE),or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)), and(tx_policy_flag.eq.true,or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)), tx_policy_amount.lt.0.0001, tx_state.in.(DRAFT)))',
      ],
    });
    expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(params);
    // @ts-ignore
    expect(transactionService.generateStateOrFilter).toHaveBeenCalledOnceWith(filters, params);
  });

  it('generateStateOrFilter(): should generate state Or filters', () => {
    const filters = { state: ['READY_TO_REPORT', 'POLICY_VIOLATED', 'CANNOT_REPORT', 'DRAFT'] };
    const params = {
      or: [
        '(and(tx_state.in.(COMPLETE),or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)), and(tx_policy_flag.eq.true,or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)), tx_policy_amount.lt.0.0001, tx_state.in.(DRAFT))',
      ],
      tx_report_id: 'is.null',
    };

    const stateOrFilter = [
      'and(tx_state.in.(COMPLETE),or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001))',
      'and(tx_policy_flag.eq.true,or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001))',
      'tx_policy_amount.lt.0.0001',
      'tx_state.in.(DRAFT)',
    ];
    // @ts-ignore
    expect(transactionService.generateStateOrFilter(filters, params)).toEqual(stateOrFilter);
  });

  it('generateTypeOrFilter(): should generate type Or filters', () => {
    const filters = { type: ['Mileage', 'PerDiem', 'RegularExpenses'] };
    const typeOrFilter = [
      'tx_fyle_category.eq.Mileage',
      'tx_fyle_category.eq.Per Diem',
      'and(tx_fyle_category.not.eq.Mileage, tx_fyle_category.not.eq.Per Diem)',
    ];

    // @ts-ignore
    expect(transactionService.generateTypeOrFilter(filters)).toEqual(typeOrFilter);
  });

  it('getPaymentModeforEtxn(): should return payment mode for etxn', () => {
    spyOn(transactionService, 'isEtxnInPaymentMode').and.returnValue(true);
    const paymentModeList = [
      {
        name: 'Reimbursable',
        key: 'reimbursable',
      },
      {
        name: 'Non-Reimbursable',
        key: 'nonReimbursable',
      },
      {
        name: 'Advance',
        key: 'advance',
      },
      {
        name: 'CCC',
        key: 'ccc',
      },
    ];
    const etxnPaymentMode = { name: 'Reimbursable', key: 'reimbursable' };
    // @ts-ignore
    expect(transactionService.getPaymentModeForEtxn(expenseData1, paymentModeList)).toEqual(etxnPaymentMode);
    expect(transactionService.isEtxnInPaymentMode).toHaveBeenCalledOnceWith(
      expenseData1.tx_skip_reimbursement,
      expenseData1.source_account_type,
      etxnPaymentMode.key,
    );
  });

  describe('isEtxnInPaymentMode():', () => {
    it('should return isEtxnInPaymentMode with reimbursable payment mode', () => {
      const txnSkipReimbursement = false;
      const txnPaymentMode = 'reimbursable';
      const txnSourceAccountType = AccountType.PERSONAL;
      expect(
        transactionService.isEtxnInPaymentMode(txnSkipReimbursement, txnSourceAccountType, txnPaymentMode),
      ).toBeTrue();
    });

    it('should return isEtxnInPaymentMode with non-reimbursable payment mode', () => {
      const txnSkipReimbursement = true;
      const txnPaymentMode = 'nonReimbursable';
      const txnSourceAccountType = AccountType.PERSONAL;
      expect(
        transactionService.isEtxnInPaymentMode(txnSkipReimbursement, txnSourceAccountType, txnPaymentMode),
      ).toBeTrue();
    });

    it('should return isEtxnInPaymentMode with advance payment mode', () => {
      const txnSkipReimbursement = false;
      const txnPaymentMode = 'advance';
      const txnSourceAccountType = AccountType.ADVANCE;
      expect(
        transactionService.isEtxnInPaymentMode(txnSkipReimbursement, txnSourceAccountType, txnPaymentMode),
      ).toBeTrue();
    });

    it('should return isEtxnInPaymentMode with advance payment mode', () => {
      const txnSkipReimbursement = false;
      const txnPaymentMode = 'ccc';
      const txnSourceAccountType = AccountType.CCC;
      expect(
        transactionService.isEtxnInPaymentMode(txnSkipReimbursement, txnSourceAccountType, txnPaymentMode),
      ).toBeTrue();
    });
  });

  describe('addEtxnToCurrencyMap():', () => {
    it('should add a new currency to the map when the currencyMap does not exist', () => {
      const currencyMap = {};
      const txCurrency = 'USD';
      const txAmount = 10;
      // @ts-ignore
      transactionService.addEtxnToCurrencyMap(currencyMap, txCurrency, txAmount);

      expect(currencyMap).toEqual({
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 10,
          origAmount: 10,
          count: 1,
        },
      });
    });

    it('should add a new currency to the map with the orig currency', () => {
      const currencyMap = {};
      const txCurrency = 'USD';
      const txAmount = 10;
      const txOrigAmount = 200;
      // @ts-ignore
      transactionService.addEtxnToCurrencyMap(currencyMap, txCurrency, txAmount, txOrigAmount);

      expect(currencyMap).toEqual({
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 10,
          origAmount: 200,
          count: 1,
        },
      });
    });

    it('should add the transaction amount to an existing currency in the map', () => {
      const currencyMap = {
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 10,
          origAmount: 10,
          count: 1,
        },
      };
      const txCurrency = 'USD';
      const txAmount = 20;
      // @ts-ignore
      transactionService.addEtxnToCurrencyMap(currencyMap, txCurrency, txAmount);

      expect(currencyMap).toEqual({
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 30,
          origAmount: 30,
          count: 2,
        },
      });
    });

    it('should add the transaction amount and original amount to an existing currency in the map', () => {
      const currencyMap = {
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 10,
          origAmount: 10,
          count: 1,
        },
      };
      const txCurrency = 'USD';
      const txAmount = 20;
      const txOrigAmount = 30;
      // @ts-ignore
      transactionService.addEtxnToCurrencyMap(currencyMap, txCurrency, txAmount, txOrigAmount);

      expect(currencyMap).toEqual({
        USD: {
          name: 'USD',
          currency: 'USD',
          amount: 30,
          origAmount: 40,
          count: 2,
        },
      });
    });
  });

  it('getCurrenyWiseSummary(): should return the currency wise summary', () => {
    // @ts-ignore
    spyOn(transactionService, 'addEtxnToCurrencyMap').and.callThrough();

    const currencyMap = {
      INR: { name: 'INR', currency: 'INR', amount: 89, origAmount: 89, count: 1 },
      CLF: { name: 'CLF', currency: 'CLF', amount: 33611, origAmount: 12, count: 1 },
      EUR: { name: 'EUR', currency: 'EUR', amount: 15775.76, origAmount: 178, count: 1 },
    };

    expect(transactionService.getCurrenyWiseSummary(expenseList4)).toEqual(currencySummaryData);
    // @ts-ignore
    expect(transactionService.addEtxnToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'INR', 89);
    // @ts-ignore
    expect(transactionService.addEtxnToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'CLF', 33611, 12);
    // @ts-ignore
    expect(transactionService.addEtxnToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'EUR', 15775.76, 178);
    // @ts-ignore
    expect(transactionService.addEtxnToCurrencyMap).toHaveBeenCalledTimes(3);
  });

  it('getPaymentModeWiseSummary(): should return the payment mode wise summary', () => {
    // @ts-ignore
    spyOn(transactionService, 'getPaymentModeForEtxn').and.returnValue({
      name: 'Reimbursable',
      key: 'reimbursable',
    });

    const paymentModes = [
      {
        name: 'Reimbursable',
        key: 'reimbursable',
      },
      {
        name: 'Non-Reimbursable',
        key: 'nonReimbursable',
      },
      {
        name: 'Advance',
        key: 'advance',
      },
      {
        name: 'CCC',
        key: 'ccc',
      },
    ];

    const summary = {
      reimbursable: {
        name: 'Reimbursable',
        key: 'reimbursable',
        amount: 49475.76,
        count: 3,
      },
    };

    expect(transactionService.getPaymentModeWiseSummary(expenseList4)).toEqual(summary);
    // @ts-ignore
    expect(transactionService.getPaymentModeForEtxn).toHaveBeenCalledWith(expenseList4[0], paymentModes);
    // @ts-ignore
    expect(transactionService.getPaymentModeForEtxn).toHaveBeenCalledWith(expenseList4[1], paymentModes);
    // @ts-ignore
    expect(transactionService.getPaymentModeForEtxn).toHaveBeenCalledWith(expenseList4[2], paymentModes);
    // @ts-ignore
    expect(transactionService.getPaymentModeForEtxn).toHaveBeenCalledTimes(3);
  });

  describe('setSortParams():', () => {
    const currentParams = { pageNumber: 1 };
    const filters = { sortParam: 'tx_txn_dt', sortDir: 'desc' };
    const emptyFilters = { sortParam: null, sortDir: 'desc' };
    const sortParams = { pageNumber: 1, sortParam: 'tx_txn_dt', sortDir: 'desc' };
    beforeEach(() => {
      spyOn(lodash, 'cloneDeep').and.returnValue(currentParams);
    });

    it('should set sort params with sortParam and sortDir', () => {
      expect(transactionService.setSortParams(currentParams, filters)).toEqual(sortParams);
    });

    it('should set sort params without filters sortParam and sortDir', () => {
      expect(transactionService.setSortParams(currentParams, emptyFilters)).toEqual(sortParams);
    });

    afterEach(() => {
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(currentParams);
    });
  });

  it('generateTypeFilters(): should generate type filters', () => {
    const filters = { type: ['Mileage', 'PerDiem', 'RegularExpenses'] };
    const newQueryParams = { or: [] };
    const typeOrFilterRes = [
      'tx_fyle_category.eq.Mileage',
      'tx_fyle_category.eq.Per Diem',
      'and(tx_fyle_category.not.eq.Mileage, tx_fyle_category.not.eq.Per Diem)',
    ];
    spyOn(lodash, 'cloneDeep').and.returnValue(newQueryParams);
    // @ts-ignore
    spyOn(transactionService, 'generateTypeOrFilter').and.returnValue(typeOrFilterRes);

    expect(transactionService.generateTypeFilters(newQueryParams, filters)).toEqual({
      or: [
        '(tx_fyle_category.eq.Mileage, tx_fyle_category.eq.Per Diem, and(tx_fyle_category.not.eq.Mileage, tx_fyle_category.not.eq.Per Diem))',
      ],
    });
    expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(newQueryParams);
    // @ts-ignore
    expect(transactionService.generateTypeOrFilter).toHaveBeenCalledOnceWith(filters);
  });

  describe('generateCustomDateParams():', () => {
    const newQueryParams = { or: [] };
    beforeEach(() => {
      spyOn(lodash, 'cloneDeep').and.returnValue(newQueryParams);
    });
    const filters = {
      date: 'custom',
      customDateStart: new Date('2023-01-17T18:30:00.000Z'),
      customDateEnd: new Date('2023-01-23T18:30:00.000Z'),
    };

    const filtersWithStartDateOnly = {
      date: 'custom',
      customDateStart: new Date('2023-01-17T18:30:00.000Z'),
    };

    const filtersWithEndDateOnly = {
      date: 'custom',
      customDateEnd: new Date('2023-01-23T18:30:00.000Z'),
    };

    const customDateParams = {
      or: [],
      and: '(tx_txn_dt.gte.2023-01-17T18:30:00.000Z,tx_txn_dt.lt.2023-01-23T18:30:00.000Z)',
    };

    const customDateParamsWithStartDateOnly = {
      or: [],
      and: '(tx_txn_dt.gte.2023-01-17T18:30:00.000Z)',
    };

    const customDateParamsWithEndDateOnly = {
      or: [],
      and: '(tx_txn_dt.lt.2023-01-23T18:30:00.000Z)',
    };

    it('should generate custom date filters with start and end date', () => {
      // @ts-ignore
      expect(transactionService.generateCustomDateParams(newQueryParams, filters)).toEqual(customDateParams);
    });

    it('should return custom date params with start date only', () => {
      // @ts-ignore
      expect(transactionService.generateCustomDateParams(newQueryParams, filtersWithStartDateOnly)).toEqual(
        customDateParamsWithStartDateOnly,
      );
    });

    it('should return custom date params with end date only', () => {
      // @ts-ignore
      expect(transactionService.generateCustomDateParams(newQueryParams, filtersWithEndDateOnly)).toEqual(
        customDateParamsWithEndDateOnly,
      );
    });

    afterEach(() => {
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(newQueryParams);
    });
  });

  describe('generateDateParams():', () => {
    const queryParams = { or: [] };
    it('should generate date params with date filter of this month', () => {
      const thisMonth = {
        from: new Date('2022-12-31T18:30:00.000Z'),
        to: new Date('2023-01-31T18:29:00.000Z'),
      };
      const customDateParams = {
        or: [],
        and: `(tx_txn_dt.gte.${thisMonth.from.toISOString()},tx_txn_dt.lt.${thisMonth.to.toISOString()})`,
      };
      const filters = { date: 'thisMonth' };
      const dateParams = {
        or: [],
        and: `(tx_txn_dt.gte.${thisMonth.from.toISOString()},tx_txn_dt.lt.${thisMonth.to.toISOString()})`,
      };

      spyOn(lodash, 'cloneDeep').and.returnValue(queryParams);
      // @ts-ignore
      spyOn(transactionService, 'generateCustomDateParams').and.returnValue(customDateParams);
      dateService.getThisMonthRange.and.returnValue(thisMonth);

      // @ts-ignore
      expect(transactionService.generateDateParams(queryParams, filters)).toEqual(dateParams);
      expect(dateService.getThisMonthRange).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(transactionService.generateCustomDateParams).toHaveBeenCalledOnceWith(customDateParams, filters);
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(queryParams);
    });

    it('should generate date params with date filter of this week', () => {
      const thisWeek = {
        from: dayjs().startOf('week'),
        to: dayjs().startOf('week').add(7, 'days'),
      };
      const customDateParams = {
        or: [],
        and: `(tx_txn_dt.gte.${thisWeek.from.toISOString()},tx_txn_dt.lt.${thisWeek.to.toISOString()})`,
      };

      const filters = { date: 'thisWeek' };
      const dateParams = {
        or: [],
        and: `(tx_txn_dt.gte.${thisWeek.from.toISOString()},tx_txn_dt.lt.${thisWeek.to.toISOString()})`,
      };

      spyOn(lodash, 'cloneDeep').and.returnValue(queryParams);
      // @ts-ignore
      spyOn(transactionService, 'generateCustomDateParams').and.returnValue(customDateParams);
      dateService.getThisWeekRange.and.returnValue(thisWeek);

      // @ts-ignore
      expect(transactionService.generateDateParams(queryParams, filters)).toEqual(dateParams);
      expect(dateService.getThisWeekRange).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(transactionService.generateCustomDateParams).toHaveBeenCalledOnceWith(customDateParams, filters);
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(queryParams);
    });

    it('should generate date params with date filter of last month', () => {
      const lastMonth = {
        from: new Date('2022-11-30T18:30:00.000Z'),
        to: new Date('2022-12-31T18:29:00.000Z'),
      };
      const filters = { date: 'lastMonth' };
      const dateParams = {
        or: [],
        and: `(tx_txn_dt.gte.${lastMonth.from.toISOString()},tx_txn_dt.lt.${lastMonth.to.toISOString()})`,
      };
      const customDateParams = {
        or: [],
        and: `(tx_txn_dt.gte.${lastMonth.from.toISOString()},tx_txn_dt.lt.${lastMonth.to.toISOString()})`,
      };

      spyOn(lodash, 'cloneDeep').and.returnValue(queryParams);
      // @ts-ignore
      spyOn(transactionService, 'generateCustomDateParams').and.returnValue(customDateParams);
      dateService.getLastMonthRange.and.returnValue(lastMonth);

      // @ts-ignore
      expect(transactionService.generateDateParams(queryParams, filters)).toEqual(dateParams);
      expect(dateService.getLastMonthRange).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(transactionService.generateCustomDateParams).toHaveBeenCalledOnceWith(customDateParams, filters);
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(queryParams);
    });

    it('should generate date params with custom date filter', () => {
      const filters = {
        date: 'custom',
        customDateStart: new Date('2023-01-17T18:30:00.000Z'),
        customDateEnd: new Date('2023-01-23T18:30:00.000Z'),
      };
      const dateParams = {
        or: [],
        and: '(tx_txn_dt.gte.2023-01-17T18:30:00.000Z,tx_txn_dt.lt.2023-01-23T18:30:00.000Z)',
      };

      spyOn(lodash, 'cloneDeep').and.returnValue(queryParams);
      // @ts-ignore
      spyOn(transactionService, 'generateCustomDateParams').and.returnValue(dateParams);

      // @ts-ignore
      expect(transactionService.generateDateParams(queryParams, filters)).toEqual(dateParams);
      // @ts-ignore
      expect(transactionService.generateCustomDateParams).toHaveBeenCalledOnceWith(queryParams, filters);
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(queryParams);
    });
  });

  it('unmatchCCCExpense(): should unmatch ccc expense', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(unmatchCCCExpenseResponseData));

    const id = 'btxnSte7sVQCM8';
    const expenseId = 'txmF3wgfj0Bs';

    const payload = {
      id,
      expense_ids: [expenseId],
    };

    transactionService.unmatchCCCExpense(id, expenseId).subscribe((res) => {
      expect(res).toEqual(unmatchCCCExpenseResponseData);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_card_transactions/unmatch', {
        data: payload,
      });
      done();
    });
  });

  describe('getVendorDetails():', () => {
    it('should return vendor details for normal expense', () => {
      expect(transactionService.getVendorDetails(expenseData1)).toEqual('asd');
    });

    it('should return vendor details for mileage expense with distance', () => {
      expect(transactionService.getVendorDetails(mileageExpenseWithDistance)).toEqual('25 KM');
    });

    it('should return vendor details for mileage expense without distance', () => {
      expect(transactionService.getVendorDetails(mileageExpenseWithoutDistance)).toEqual('0 KM');
    });

    it('should retuen vendor details for per diem expense with 1 day', () => {
      expect(transactionService.getVendorDetails(perDiemExpenseSingleNumDays)).toEqual('1 Day');
    });

    it('should retuen vendor details for per diem expense with multiple days', () => {
      expect(transactionService.getVendorDetails(perDiemExpenseMultipleNumDays)).toEqual('3 Days');
    });
  });

  describe('getExpenseDeletionMessage():', () => {
    it('should return expense deletion message for single', () => {
      expect(transactionService.getExpenseDeletionMessage(apiExpenseRes)).toEqual(
        'You are about to permanently delete 1 selected expense.',
      );
    });

    it('getExpenseDeletionMessage(): should return expense deletion message for multiple expenses', () => {
      expect(transactionService.getExpenseDeletionMessage(expenseList2)).toEqual(
        'You are about to permanently delete 2 selected expenses.',
      );
    });
  });

  describe('getCCCExpenseMessage():', () => {
    it('should return ccc expense message for single ccc expense', () => {
      expect(transactionService.getCCCExpenseMessage(apiExpenseRes, 1)).toEqual(
        "There is 1 corporate card expense from the selection which can't be deleted. However you can delete the other expenses from the selection.",
      );
    });

    it('should return ccc expense message for multiple ccc expenses', () => {
      expect(transactionService.getCCCExpenseMessage(expenseList2, 2)).toEqual(
        "There are 2 corporate card expenses from the selection which can't be deleted. However you can delete the other expenses from the selection.",
      );
    });

    it('should return ccc expense message for with only ccc expenses selected', () => {
      expect(transactionService.getCCCExpenseMessage(null, 3)).toEqual(
        "There are 3 corporate card expenses from the selection which can't be deleted.",
      );
    });
  });

  describe('getDeleteDialogBody():', () => {
    it('should return delete dialog body with deletable expenses and ccc expenses', () => {
      const cccExpensesMessage =
        "There is 1 corporate card expense from the selection which can't be deleted. However you can delete the other expenses from the selection.";
      const deletableExpensesMessage = 'You are about to permanently delete 1 selected expense.';
      expect(
        transactionService.getDeleteDialogBody(apiExpenseRes, 1, deletableExpensesMessage, cccExpensesMessage),
      ).toEqual(
        `<ul class="text-left">
        <li>${cccExpensesMessage}</li>
        <li>Once deleted, the action can't be reversed.</li>
        </ul>
        <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`,
      );
    });

    it('should return delete dialog body with only deletable expenses', () => {
      const deletableExpensesMessage = 'You are about to permanently delete 1 selected expense.';
      expect(transactionService.getDeleteDialogBody(apiExpenseRes, 0, deletableExpensesMessage, null)).toEqual(
        `<ul class="text-left">
      <li>${deletableExpensesMessage}</li>
      <li>Once deleted, the action can't be reversed.</li>
      </ul>
      <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`,
      );
    });

    it('should return delete dialog body with only ccc expenses', () => {
      const cccExpensesMessage =
        "There is 1 corporate card expense from the selection which can't be deleted. However you can delete the other expenses from the selection.";
      expect(transactionService.getDeleteDialogBody([], 1, null, cccExpensesMessage)).toEqual(
        `<ul class="text-left">
      <li>${cccExpensesMessage}</li>
      </ul>`,
      );
    });
  });

  describe('generateCardNumberParams():', () => {
    const params = { or: [] };
    it('should generate card number params without card number filters', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue({ or: [] });
      expect(transactionService.generateCardNumberParams(params, {})).toEqual(params);
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(params);
    });

    it('should generate card number params with card number filters', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue({ or: [] });
      const filters = { cardNumbers: ['8698'] };
      const cardNumberParams = {
        or: [],
        corporate_credit_card_account_number: 'in.(8698)',
      };

      expect(transactionService.generateCardNumberParams(params, filters)).toEqual(cardNumberParams);
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(params);
    });
  });

  it('getTxnAccount(): should get the default txn account', (done) => {
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    accountsService.getMyAccounts.and.returnValue(of(accountsData));
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
    const mockAccount = { ...accountsData[0], isReimbursable: false };
    paymentModesService.getDefaultAccount.and.returnValue(of(mockAccount));

    const expectedResult = {
      source_account_id: 'acc5APeygFjRd',
      skip_reimbursement: true,
    };

    // @ts-ignore
    transactionService.getTxnAccount().subscribe((res) => {
      expect(res).toEqual(expectedResult);
      expect(paymentModesService.getDefaultAccount).toHaveBeenCalledOnceWith(
        orgSettingsData,
        accountsData,
        employeeSettingsData,
      );
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(accountsService.getMyAccounts).toHaveBeenCalledTimes(1);
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getPersonalAccount(): should get the personal account', (done) => {
    accountsService.getMyAccounts.and.returnValue(of(accountsData));

    const expectedResult = {
      source_account_id: 'acc5APeygFjRd',
    };

    // @ts-ignore
    transactionService.getPersonalAccount().subscribe((res) => {
      expect(res).toEqual(expectedResult);
      expect(accountsService.getMyAccounts).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('isMergeAllowed():', () => {
    it('should return false if the expenses list length is not equal to 2', () => {
      expect(transactionService.isMergeAllowed(apiExpenseRes)).toBeFalse();
    });

    it('should return false if all the expenses are submitted', () => {
      expect(transactionService.isMergeAllowed(expenseList2)).toBeFalse();
    });

    it('should return true if expenses are not submitted and not mileage or per diem and either one of them is a corporate card expenses', () => {
      expect(transactionService.isMergeAllowed(expenseList3)).toBeTrue();
    });
  });

  it('excludeCCCExpenses(): should exclude CCC expenses', () => {
    expect(transactionService.excludeCCCExpenses(expenseList3)).toEqual([expenseList3[1]]);
  });

  describe('getReportableExpenses(): ', () => {
    it('should return reportable expenses', () => {
      spyOn(transactionService, 'getIsCriticalPolicyViolated').and.returnValue(false);
      spyOn(transactionService, 'getIsDraft').and.returnValue(false);

      expect(transactionService.getReportableExpenses(apiExpenseRes)).toEqual([apiExpenseRes[0]]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledOnceWith(apiExpenseRes[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledOnceWith(apiExpenseRes[0]);
    });

    it('should return undefined if expenses are 0', () => {
      spyOn(transactionService, 'getIsCriticalPolicyViolated').and.returnValue(false);
      spyOn(transactionService, 'getIsDraft').and.returnValue(false);

      expect(transactionService.getReportableExpenses(null)).toBeUndefined();
      expect(transactionService.getIsCriticalPolicyViolated).not.toHaveBeenCalled();
      expect(transactionService.getIsDraft).not.toHaveBeenCalled();
    });
  });

  it('matchCCCExpense(): should match ccc expense', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(matchCCCExpenseResponseData));

    const id = 'btxnSte7sVQCM8';
    const expenseId = 'txmF3wgfj0Bs';

    const payload = {
      id,
      expense_ids: [expenseId],
    };

    transactionService.matchCCCExpense(id, expenseId).subscribe((res) => {
      expect(res).toEqual(matchCCCExpenseResponseData);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_card_transactions/match', {
        data: payload,
      });
      done();
    });
  });

  it('checkPolicy(): should check policy', (done) => {
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
    spenderPlatformV1ApiService.post.and.returnValue(of(expensePolicyData));

    const mockPlatformExpense = cloneDeep(platformPolicyExpenseData1);
    transactionService.checkPolicy(mockPlatformExpense).subscribe((res) => {
      expect(res).toEqual(expensePolicyData);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/expenses/check_policies', {
        data: mockPlatformExpense,
      });
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('createTxnWithFiles():', () => {
    it('should create transaction with files', (done) => {
      const mockFileObject = cloneDeep(fileObjectData1);

      spyOn(transactionService, 'upsert').and.returnValue(of(txnData2));
      expensesService.createFromFile.and.returnValue(of({ data: [expenseData] }));
      transactionService.createTxnWithFiles({ ...txnData }, of(mockFileObject)).subscribe((res) => {
        expect(res).toEqual(txnData2);
        expect(expensesService.createFromFile).toHaveBeenCalledOnceWith(mockFileObject[0].id, 'MOBILE_DASHCAM_BULK');
        expect(transactionService.upsert).toHaveBeenCalledOnceWith({
          ...txnDataCleaned,
          id: expenseData.id,
        });
        done();
      });
    });

    it('should create transaction from file when txn contains only source', (done) => {
      const mockFileObject = cloneDeep(fileObjectData1);
      const txnWithSourceOnly = { source: 'MOBILE_DASHCAM' };

      expensesService.createFromFile.and.returnValue(of({ data: [expenseData] }));
      spyOn(transactionService, 'transformExpense').and.returnValue({ tx: txnData2 });

      transactionService.createTxnWithFiles(txnWithSourceOnly, of(mockFileObject)).subscribe((res) => {
        expect(expensesService.createFromFile).toHaveBeenCalledOnceWith(mockFileObject[0].id, 'MOBILE_DASHCAM');
        expect(transactionService.transformExpense).toHaveBeenCalled();
        expect(res).toEqual(txnData2);
        done();
      });
    });
  });

  it('upsert(): should upsert transaction', (done) => {
    const offset = employeeSettingsData.locale.offset;
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
    // @ts-ignore
    spyOn(transactionService, 'getTxnAccount').and.returnValue(of(txnAccountData));
    // @ts-ignore
    spyOn(transactionService, 'getPersonalAccount').and.returnValue(of(personalAccountData));
    spyOn(transactionService, 'transformExpense').and.returnValue({ tx: txnData4 });
    timezoneService.convertAllDatesToProperLocale.and.returnValue(txnCustomPropertiesData2);
    utilityService.discardRedundantCharacters.and.returnValue(txnDataPayload);
    expensesService.transformTo.and.returnValue(transformedExpensePayload);
    expensesService.post.and.returnValue(of({ data: expenseData }));

    const mockUpsertTxnParam = cloneDeep(upsertTxnParam);
    transactionService.upsert(mockUpsertTxnParam).subscribe((res) => {
      expect(res).toEqual(txnData4);
      expect(expensesService.transformTo).toHaveBeenCalledOnceWith(txnDataPayload);
      expect(expensesService.post).toHaveBeenCalledOnceWith(transformedExpensePayload);
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(timezoneService.convertAllDatesToProperLocale).toHaveBeenCalledOnceWith(txnCustomPropertiesData6, offset);
      expect(timezoneService.convertToUtc).toHaveBeenCalledTimes(2);
      // @ts-ignore
      expect(transactionService.getTxnAccount).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(transactionService.getPersonalAccount).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('upsert(): should upsert transaction', (done) => {
    const offset = employeeSettingsData.locale.offset;
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
    // @ts-ignore
    spyOn(transactionService, 'getTxnAccount').and.returnValue(of(txnAccountData));
    // @ts-ignore
    spyOn(transactionService, 'getPersonalAccount').and.returnValue(of(personalAccountData));
    spyOn(transactionService, 'transformExpense').and.returnValue({ tx: txnData4 });
    timezoneService.convertAllDatesToProperLocale.and.returnValue(txnCustomPropertiesData2);
    utilityService.discardRedundantCharacters.and.returnValue(txnDataPayload);
    expensesService.transformTo.and.returnValue(transformedExpensePayload);
    expensesService.post.and.returnValue(of({ data: expenseData }));

    const mockUpsertTxnParam = cloneDeep(upsertTxnParam);
    transactionService.upsert(mockUpsertTxnParam).subscribe((res) => {
      expect(res).toEqual(txnData4);
      expect(expensesService.transformTo).toHaveBeenCalledOnceWith(txnDataPayload);
      expect(expensesService.post).toHaveBeenCalledOnceWith(transformedExpensePayload);
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(timezoneService.convertAllDatesToProperLocale).toHaveBeenCalledOnceWith(txnCustomPropertiesData6, offset);
      expect(timezoneService.convertToUtc).toHaveBeenCalledTimes(2);
      // @ts-ignore
      expect(transactionService.getTxnAccount).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(transactionService.getPersonalAccount).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
