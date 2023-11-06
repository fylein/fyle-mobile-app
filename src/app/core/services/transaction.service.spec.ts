import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import {
  etxncData,
  expenseData2,
  expenseData1,
  expenseDataWithDateString,
  etxnData,
  expenseList,
  etxncListData,
  mileageExpenseWithDistance,
  mileageExpenseWithoutDistance,
  perDiemExpenseSingleNumDays,
  perDiemExpenseMultipleNumDays,
  apiExpenseRes,
  expenseList2,
  expenseData3,
  expenseList3,
  expenseList4,
} from '../mock-data/expense.data';
import { UndoMergeData } from '../mock-data/undo-merge.data';
import { AccountsService } from './accounts.service';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { NetworkService } from './network.service';
import { OrgSettingsService } from './org-settings.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { PaymentModesService } from './payment-modes.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { StorageService } from './storage.service';
import { TimezoneService } from './timezone.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';
import { UtilityService } from './utility.service';
import { transactionsCacheBuster$ } from './transaction.service';
import * as dayjs from 'dayjs';
import { eouRes2 } from '../mock-data/extended-org-user.data';
import { txnStats } from '../mock-data/stats-response.data';
import { expenseV2Data, expenseV2DataMultiple } from '../mock-data/expense-v2.data';
import * as lodash from 'lodash';
import { txnData, txnData2, txnData4, txnDataPayload, txnList, upsertTxnParam } from '../mock-data/transaction.data';
import { unflattenedTxnData, unflattenedTxnDataWithSubCategory } from '../mock-data/unflattened-txn.data';
import { fileObjectData, fileObjectData1, fileObjectData2 } from '../mock-data/file-object.data';
import { AccountType } from '../enums/account-type.enum';
import { orgUserSettingsData, orgUserSettingsData2, orgUserSettingsData3 } from '../mock-data/org-user-settings.data';
import { orgSettingsData } from '../test-data/org-settings.service.spec.data';
import { accountsData } from '../test-data/accounts.service.spec.data';
import { currencySummaryData } from '../mock-data/currency-summary.data';
import { platformPolicyExpenseData1 } from '../mock-data/platform-policy-expense.data';
import { expensePolicyData } from '../mock-data/expense-policy.data';
import { txnAccountData } from '../mock-data/txn-account.data';
import { txnCustomPropertiesData2, txnCustomPropertiesData6 } from '../mock-data/txn-custom-properties.data';
import { FilterQueryParams } from '../models/filter-query-params.model';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let networkService: jasmine.SpyObj<NetworkService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let authService: jasmine.SpyObj<AuthService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: jasmine.SpyObj<DateService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let fileService: jasmine.SpyObj<FileService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let paymentModesService: jasmine.SpyObj<PaymentModesService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let accountsService: jasmine.SpyObj<AccountsService>;

  beforeEach(() => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['isOnline']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get', 'getStats']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'fixDates',
      'fixDatesV2',
      'getThisMonthRange',
      'getThisWeekRange',
      'getLastMonthRange',
    ]);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
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
    const accountsServiceSpy = jasmine.createSpyObj('AccountsService', ['getEMyAccounts']);

    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiV2ServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
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
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
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
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });

    transactionService = TestBed.inject(TransactionService);
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
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
  });

  it('should be created', () => {
    expect(transactionService).toBeTruthy();
  });

  it('clearCache(): should clear cache', (done) => {
    const notifierSpy = spyOn(transactionsCacheBuster$, 'next').and.callThrough();
    transactionService.clearCache().subscribe((res) => {
      expect(notifierSpy).toHaveBeenCalledTimes(1);
      expect(res).toBeNull();
      done();
    });
  });

  it('manualFlag(): should manually flag a transaction', (done) => {
    const transactionID = 'tx5fBcPBAxLv';
    apiService.post.and.returnValue(of(expenseData2));

    transactionService.manualFlag(transactionID).subscribe((res) => {
      expect(res).toEqual(expenseData2);
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/' + transactionID + '/manual_flag');
      done();
    });
  });

  it('manualUnflag(): should manually unflag a transaction', (done) => {
    const transactionID = 'tx5fBcPBAxLv';
    apiService.post.and.returnValue(of(expenseData1));

    transactionService.manualUnflag(transactionID).subscribe((res) => {
      expect(res).toEqual(expenseData1);
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/' + transactionID + '/manual_unflag');
      done();
    });
  });

  it('delete(): should delete a transaction', (done) => {
    const transactionID = 'tx5fBcPBAxLv';
    apiService.delete.and.returnValue(of(expenseData1));

    transactionService.delete(transactionID).subscribe((res) => {
      expect(res).toEqual(expenseData1);
      expect(apiService.delete).toHaveBeenCalledOnceWith('/transactions/' + transactionID);
      done();
    });
  });

  it('getETxnc(): should get list of extended transactions', (done) => {
    apiV2Service.get.and.returnValue(of(etxncData));

    const params = {
      offset: 0,
      limit: 1,
      params: {
        tx_org_user_id: 'eq.ouX8dwsbLCLv',
        tx_report_id: 'eq.rpFvmTgyeBjN',
        order: 'tx_txn_dt.desc,tx_id.desc',
      },
    };

    transactionService.getETxnc(params).subscribe((res) => {
      expect(res).toEqual(etxncData.data);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/expenses', params);
      done();
    });
  });

  it('getExpenseV2(): should get expense from ID', (done) => {
    apiV2Service.get.and.returnValue(of(etxncData));

    const transactionID = 'tx5fBcPBAxLv';

    transactionService.getExpenseV2(transactionID).subscribe((res) => {
      expect(res).toEqual(etxncData.data[0]);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/expenses', {
        params: {
          tx_id: `eq.${transactionID}`,
        },
      });
      done();
    });
  });

  it('getDefaultVehicleType(): should get default vehicle type', (done) => {
    const defaultVehicleType = 'two_wheeler';
    storageService.get.and.returnValue(Promise.resolve(defaultVehicleType));
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

    apiService.post.and.returnValue(of(UndoMergeData));

    transactionService.removeCorporateCardExpense(transactionID).subscribe((res) => {
      expect(res).toEqual(UndoMergeData);
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/unlink_card_expense', {
        txn_id: transactionID,
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

  it('fixDates(): should fix dates', () => {
    // @ts-ignore
    expect(transactionService.fixDates(expenseDataWithDateString)).toEqual(expenseData1);
  });

  it('getETxnCount(): should return etxn count', (done) => {
    apiV2Service.get.and.returnValue(of(etxncData));
    const params = {
      tx_org_user_id: 'eq.ouX8dwsbLCLv',
      tx_report_id: 'eq.rpFvmTgyeBjN',
      order: 'tx_txn_dt.desc,tx_id.desc',
    };

    // @ts-ignore
    transactionService.getETxnCount(params).subscribe((res) => {
      expect(res.count).toEqual(1);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/expenses', { params });
      done();
    });
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

  describe('getEtxn():', () => {
    it('it should get etxn from transaction ID without sub category', (done) => {
      apiService.get.and.returnValue(of(expenseData1));
      dateService.fixDates.and.returnValue(expenseData1);

      const transactionID = 'tx5fBcPBAxLv';
      transactionService.getEtxn(transactionID).subscribe((res) => {
        expect(res).toEqual(expenseData1);
        expect(apiService.get).toHaveBeenCalledOnceWith('/etxns/' + transactionID);
        expect(dateService.fixDates).toHaveBeenCalledOnceWith(res);
        done();
      });
    });

    it('it should get etxn from transaction ID with sub category', (done) => {
      apiService.get.and.returnValue(of(etxnData));
      dateService.fixDates.and.returnValue(etxnData);

      const transactionID = 'txCBp2jIK6G3';

      transactionService.getEtxn(transactionID).subscribe((res) => {
        expect(res).toEqual(etxnData);
        expect(apiService.get).toHaveBeenCalledOnceWith('/etxns/' + transactionID);
        expect(dateService.fixDates).toHaveBeenCalledOnceWith(res);
        done();
      });
    });
  });

  it('getTransactionStats(): should return transaction stats', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(eouRes2));
    apiV2Service.getStats.and.returnValue(of(txnStats));

    const aggregates = 'count(tx_id),sum(tx_amount)';
    const queryParams = {
      scalar: true,
      tx_state: 'in.(DRAFT)',
      tx_report_id: 'is.null',
    };

    transactionService.getTransactionStats(aggregates, queryParams).subscribe((res) => {
      expect(res).toEqual(txnStats.data);
      expect(apiV2Service.getStats).toHaveBeenCalledOnceWith('/expenses/stats', {
        params: {
          aggregates,
          tx_org_user_id: 'eq.' + eouRes2.ou.id,
          ...queryParams,
        },
      });
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getMyExpenses(): should return my expenses with order', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(eouRes2));
    apiV2Service.get.and.returnValue(of(expenseV2Data));
    dateService.fixDatesV2.and.returnValue(expenseV2Data.data[0]);

    const params = {
      offset: 0,
      limit: 1,
      queryParams: {
        or: [],
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      },
      order: 'tx_txn_dt.desc',
    };

    transactionService.getMyExpenses(params).subscribe((res) => {
      expect(res).toEqual(expenseV2Data);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/expenses', {
        params: {
          offset: params.offset,
          limit: params.limit,
          order: `${params.order || 'tx_txn_dt.desc'},tx_created_at.desc,tx_id.desc`,
          tx_org_user_id: 'eq.' + eouRes2.ou.id,
          ...params.queryParams,
        },
      });
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(dateService.fixDatesV2).toHaveBeenCalledOnceWith(res.data[0]);
      done();
    });
  });

  it('getMyExpenses(): should return my expenses without order using default date order', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(eouRes2));
    apiV2Service.get.and.returnValue(of(expenseV2Data));
    dateService.fixDatesV2.and.returnValue(expenseV2Data.data[0]);

    const params2 = {
      offset: 0,
      limit: 1,
      queryParams: {
        or: [],
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      },
    };

    transactionService.getMyExpenses(params2).subscribe((res) => {
      expect(res).toEqual(expenseV2Data);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/expenses', {
        params: {
          offset: params2.offset,
          limit: params2.limit,
          // eslint-disable-next-line @typescript-eslint/dot-notation
          order: `${params2['order'] || 'tx_txn_dt.desc'},tx_created_at.desc,tx_id.desc`,
          tx_org_user_id: 'eq.' + eouRes2.ou.id,
          ...params2.queryParams,
        },
      });
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(dateService.fixDatesV2).toHaveBeenCalledOnceWith(res.data[0]);
      done();
    });
  });

  it('getMyExpensesCount(): should return my expenses count', (done) => {
    spyOn(transactionService, 'getMyExpenses').and.returnValue(of(expenseV2Data));

    const params = {
      tx_report_id: 'is.null',
      tx_state: 'in.(COMPLETE,DRAFT)',
    };

    transactionService.getMyExpensesCount(params).subscribe((res) => {
      expect(res).toEqual(expenseV2Data.count);
      expect(transactionService.getMyExpenses).toHaveBeenCalledOnceWith({
        offset: 0,
        limit: 1,
        queryParams: params,
      });
      done();
    });
  });

  it('getAllExpenses(): should return all expenses', (done) => {
    spyOn(transactionService, 'getMyExpensesCount').and.returnValue(of(2));
    spyOn(transactionService, 'getMyExpenses').and.returnValue(of(expenseV2DataMultiple));

    const params = {
      queryParams: {
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE)',
        order: 'tx_txn_dt.desc',
        or: ['(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)'],
      },
    };

    transactionService.getAllExpenses(params).subscribe((res) => {
      expect(res).toEqual(expenseV2DataMultiple.data);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledOnceWith(params.queryParams);
      expect(transactionService.getMyExpenses).toHaveBeenCalledOnceWith({
        offset: 0,
        limit: 2,
        queryParams: params.queryParams,
        order: undefined,
      });
      done();
    });
  });

  it('getSplitExpenses(): should return split expenses', (done) => {
    spyOn(transactionService, 'getAllETxnc').and.returnValue(of(expenseList));
    const txnSplitGroupId = 'txBphgnCHHeO';

    transactionService.getSplitExpenses(txnSplitGroupId).subscribe((res) => {
      expect(res).toEqual(expenseList);
      expect(transactionService.getAllETxnc).toHaveBeenCalledOnceWith({ tx_split_group_id: 'eq.' + txnSplitGroupId });
      done();
    });
  });

  it('unmatchCCCExpense(): should unmatch ccc expense', (done) => {
    apiService.post.and.returnValue(of(null));

    const transactionId = 'txBldpJrBafX';
    const corporateCreditCardExpenseId = 'ccce4xphr6tZQm';

    transactionService.unmatchCCCExpense(transactionId, corporateCreditCardExpenseId).subscribe((res) => {
      expect(res).toBeNull();
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/unmatch', {
        transaction_id: transactionId,
        corporate_credit_card_expense_id: corporateCreditCardExpenseId,
      });
      done();
    });
  });

  it('getAllETxnc(): should return all etxnc', (done) => {
    // @ts-ignore
    spyOn(transactionService, 'getETxnCount').and.returnValue(of(1));
    spyOn(transactionService, 'getETxnc').and.returnValue(of(etxncListData.data));

    const params = {
      tx_org_user_id: 'eq.ouX8dwsbLCLv',
      tx_report_id: 'eq.rpeqN0o4X4O4',
      order: 'tx_txn_dt.desc,tx_id.desc',
    };

    transactionService.getAllETxnc(params).subscribe((res) => {
      expect(res).toEqual(etxncListData.data);
      // @ts-ignore
      expect(transactionService.getETxnCount).toHaveBeenCalledOnceWith(params);
      expect(transactionService.getETxnc).toHaveBeenCalledOnceWith({
        offset: 0,
        limit: 2,
        params: {
          tx_org_user_id: 'eq.ouX8dwsbLCLv',
          tx_report_id: 'eq.rpeqN0o4X4O4',
          order: 'tx_txn_dt.desc,tx_id.desc',
        },
      });
      done();
    });
  });

  it('deleteBulk(): should delete bulk transactions', (done) => {
    apiService.post.and.returnValue(of(txnList));
    const transactionIds = ['txzLsDY1IAAw', 'txAzvMhbD71q'];

    transactionService.deleteBulk(transactionIds).subscribe((res) => {
      expect(res).toEqual(txnList);
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/delete/bulk', {
        txn_ids: transactionIds,
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

  it('getDeletableTxns(): should return deletable transactions', () => {
    expect(transactionService.getDeletableTxns(apiExpenseRes)).toEqual(apiExpenseRes);
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
        "There are 3 corporate card expenses from the selection which can't be deleted. ",
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

  describe('getPaginatedETxncCount():', () => {
    it('should return paginated etxn count when online', (done) => {
      const response = { count: 1891 };
      networkService.isOnline.and.returnValue(of(true));
      storageService.set.and.returnValue(Promise.resolve(null));
      apiService.get.and.returnValue(of(response));

      transactionService.getPaginatedETxncCount().subscribe((res) => {
        expect(res).toEqual(response);
        expect(storageService.set).toHaveBeenCalledOnceWith('etxncCount', response);
        expect(apiService.get).toHaveBeenCalledOnceWith('/etxns/count');
        done();
      });
    });

    it('should return paginated etxn count when offline', (done) => {
      const response = { count: 1891 };
      networkService.isOnline.and.returnValue(of(false));
      storageService.get.and.returnValue(Promise.resolve(response));

      transactionService.getPaginatedETxncCount().subscribe((res) => {
        expect(res).toEqual(response);
        expect(storageService.get).toHaveBeenCalledOnceWith('etxncCount');
        expect(networkService.isOnline).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('getETxnUnflattened():', () => {
    it('it should get etxn from transaction ID without sub category', (done) => {
      apiService.get.and.returnValue(of(expenseData3));
      dataTransformService.unflatten.and.returnValue(unflattenedTxnData);
      dateService.fixDates.and.returnValue(unflattenedTxnData);

      const transactionID = 'tx3qHxFNgRcZ';
      transactionService.getETxnUnflattened(transactionID).subscribe((res) => {
        expect(res).toEqual(unflattenedTxnData);
        expect(apiService.get).toHaveBeenCalledOnceWith('/etxns/' + transactionID);
        expect(dateService.fixDates).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
        expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(expenseData3);
        done();
      });
    });

    it('it should get etxn from transaction ID with sub category', (done) => {
      apiService.get.and.returnValue(of(expenseData3));
      dataTransformService.unflatten.and.returnValue(unflattenedTxnDataWithSubCategory);
      dateService.fixDates.and.returnValue(unflattenedTxnDataWithSubCategory);

      const transactionID = 'tx3qHxFNgRcZ';

      transactionService.getETxnUnflattened(transactionID).subscribe((res) => {
        expect(res).toEqual(unflattenedTxnDataWithSubCategory);
        expect(apiService.get).toHaveBeenCalledOnceWith('/etxns/' + transactionID);
        expect(dateService.fixDates).toHaveBeenCalledOnceWith(unflattenedTxnDataWithSubCategory.tx);
        expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(expenseData3);
        done();
      });
    });
  });

  it('review(): should return transaction response on review', (done) => {
    apiService.post.and.returnValue(of(null));
    const transactionId = 'tx3qHxFNgRcZ';

    transactionService.review(transactionId).subscribe((res) => {
      expect(res).toBeNull();
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/' + transactionId + '/review');
      done();
    });
  });

  it('uploadBase64(): should uploadBase64 and return file object response', (done) => {
    const transactionID = 'txdzGV1TZEg3';
    const fileName = '000.jpeg';
    const base64Content = 'dummyBase64Value';
    apiService.post.and.returnValue(of(fileObjectData));

    transactionService.uploadBase64File(transactionID, fileName, base64Content).subscribe((res) => {
      expect(res).toEqual(fileObjectData);
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/' + transactionID + '/upload_b64', {
        content: base64Content,
        name: fileName,
      });
      done();
    });
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

  it('getTxnAccount(): should get the default txn account', (done) => {
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    accountsService.getEMyAccounts.and.returnValue(of(accountsData));
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    paymentModesService.getDefaultAccount.and.returnValue(of(accountsData[0]));

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
        orgUserSettingsData,
      );
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
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

  it('getReportableExpenses(): should return reportable expenses', () => {
    spyOn(transactionService, 'getIsCriticalPolicyViolated').and.returnValue(false);
    spyOn(transactionService, 'getIsDraft').and.returnValue(false);

    expect(transactionService.getReportableExpenses(apiExpenseRes)).toEqual([apiExpenseRes[0]]);
    expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledOnceWith(apiExpenseRes[0]);
    expect(transactionService.getIsDraft).toHaveBeenCalledOnceWith(apiExpenseRes[0]);
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

  it('matchCCCExpense(): should match ccc expense', (done) => {
    apiService.post.and.returnValue(of(null));

    const transactionId = 'txBRcjOg1spF';
    const corporateCreditCardExpenseId = 'cccetzVpWd2Pgz';

    transactionService.matchCCCExpense(transactionId, corporateCreditCardExpenseId).subscribe((res) => {
      expect(res).toBeNull();
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/match', {
        transaction_id: transactionId,
        corporate_credit_card_expense_id: corporateCreditCardExpenseId,
      });
      done();
    });
  });

  it('checkPolicy(): should check policy', (done) => {
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData2));
    spenderPlatformV1ApiService.post.and.returnValue(of(expensePolicyData));

    transactionService.checkPolicy(platformPolicyExpenseData1).subscribe((res) => {
      expect(res).toEqual(expensePolicyData);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/expenses/check_policies', {
        data: platformPolicyExpenseData1,
      });
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('createTxnWithFiles(): should create transaction with files', (done) => {
    spyOn(transactionService, 'upsert').and.returnValue(of(txnData2));
    fileService.post.and.returnValue(of(fileObjectData2));

    transactionService.createTxnWithFiles(txnData, of(fileObjectData1)).subscribe((res) => {
      expect(res).toEqual(txnData2);
      expect(transactionService.upsert).toHaveBeenCalledOnceWith(txnData);
      expect(fileService.post).toHaveBeenCalledOnceWith(fileObjectData2);
      done();
    });
  });

  it('upsert(): should upsert transaction', (done) => {
    const offset = orgUserSettingsData3.locale.offset;
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData3));
    // @ts-ignore
    spyOn(transactionService, 'getTxnAccount').and.returnValue(of(txnAccountData));
    timezoneService.convertAllDatesToProperLocale.and.returnValue(txnCustomPropertiesData2);
    apiService.post.and.returnValue(of(txnData4));
    utilityService.discardRedundantCharacters.and.returnValue(txnDataPayload);

    transactionService.upsert(upsertTxnParam).subscribe((res) => {
      expect(res).toEqual(txnData4);
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions', txnDataPayload);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(timezoneService.convertAllDatesToProperLocale).toHaveBeenCalledOnceWith(txnCustomPropertiesData6, offset);
      expect(timezoneService.convertToUtc).toHaveBeenCalledTimes(3);
      // @ts-ignore
      expect(transactionService.getTxnAccount).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
