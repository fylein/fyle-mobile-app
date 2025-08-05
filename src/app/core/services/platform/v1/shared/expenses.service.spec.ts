import { TestBed } from '@angular/core/testing';
import { currencySummaryData } from 'src/app/core/mock-data/currency-summary.data';
import {
  expenseFiltersData1,
  expenseFiltersDataAllStates,
  expenseFiltersDataLastMonth,
  expenseFiltersDataMonth,
  expenseFiltersDataWCustom,
  expenseFiltersDataWithCustomEnd,
  expenseFiltersDataWithCustomStart,
  expenseFiltersDataWoCards,
  expenseFiltersDataWoReceipts,
  expenseFiltersDataWoSplit,
  expenseWithoutPotentialDuplicateFilterData,
  expenseWithPotentialDuplicateFilterData,
} from 'src/app/core/mock-data/expense-filters.data';
import {
  apiExpenses1,
  criticalPolicyViolatedExpense,
  draftExpense,
  expenseData,
  expenseResponseData2,
  expenseResponseData3,
  mileageExpense,
  mileageExpenseWithDistance,
  mileageExpenseWithoutDistance,
  perDiemExpenseWithMultipleNumDays,
  perDiemExpenseWithSingleNumDays,
  platformExpenseDataWithPendingGasCharge,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { GetExpenseQueryParam } from 'src/app/core/models/platform/v1/get-expenses-query.model';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { ExpensesService } from './expenses.service';
import { cloneDeep } from 'lodash';
import { DateService } from '../../../date.service';
import { OrgSettingsService } from '../../../org-settings.service';
import { of } from 'rxjs';
import { orgSettingsPendingRestrictions } from 'src/app/core/mock-data/org-settings.data';
import { TranslocoService } from '@jsverse/transloco';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let dateService: DateService;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string, params?: any) => {
      const translations: { [key: string]: string } = {
        'services.expenses.day': 'Day',
        'services.expenses.days': 'Days',
        'services.expenses.reimbursable': 'Reimbursable',
        'services.expenses.nonReimbursable': 'Non-Reimbursable',
        'services.expenses.advance': 'Advance',
        'services.expenses.ccc': 'CCC',
        'services.expenses.aboutToDelete': 'You are about to permanently delete',
        'services.expenses.oneSelectedExpense': '1 selected expense.',
        'services.expenses.multipleSelectedExpenses': '{count} selected expenses.',
        'services.expenses.cccMessageSingular':
          "There is {count} corporate card expense from the selection which can't be deleted.",
        'services.expenses.cccMessagePlural':
          "There are {count} corporate card expenses from the selection which can't be deleted.",
        'services.expenses.deleteOthersMessage': 'However you can delete the other expenses from the selection.',
        'services.expenses.actionCannotBeReversed': "Once deleted, the action can't be reversed.",
        'services.expenses.permanentDeleteConfirmation':
          'Are you sure to <b>permanently</b> delete the selected expenses?',
      };

      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && params.count !== undefined) {
        translation = translation.replace('{count}', params.count.toString());
      }

      return translation;
    });

    TestBed.configureTestingModule({
      providers: [
        DateService,
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    service = TestBed.inject(ExpensesService);
    dateService = TestBed.inject(DateService);
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isCriticalPolicyViolatedExpense():', () => {
    it('should return false if critical policy is not violated', () => {
      expect(service.isCriticalPolicyViolatedExpense(expenseData)).toBeFalse();
    });

    it('should return true if critical policy is violated', () => {
      expect(service.isCriticalPolicyViolatedExpense(criticalPolicyViolatedExpense)).toBeTrue();
    });
  });

  describe('isExpenseInDraft():', () => {
    it('should return true if transaction is draft', () => {
      const expense: Expense = {
        ...expenseData,
        state: ExpenseState.DRAFT,
      };
      expect(service.isExpenseInDraft(expense)).toBeTrue();
    });

    it('should return false if transaction is not draft', () => {
      const expense: Expense = {
        ...expenseData,
        state: ExpenseState.COMPLETE,
      };
      expect(service.isExpenseInDraft(expense)).toBeFalse();
    });
  });

  describe('getVendorDetails():', () => {
    it('should return vendor details for normal expense', () => {
      const merchant = 'UberTest';
      const expense: Expense = {
        ...expenseData,
        merchant,
      };
      expect(service.getVendorDetails(expense)).toEqual(merchant);
    });

    it('should return vendor details for mileage expense with distance', () => {
      expect(service.getVendorDetails(mileageExpenseWithDistance)).toEqual('25 KM');
    });

    it('should return vendor details for mileage expense without distance', () => {
      expect(service.getVendorDetails(mileageExpenseWithoutDistance)).toEqual('0 KM');
    });

    it('should return vendor details for per diem expense with 1 day', () => {
      expect(service.getVendorDetails(perDiemExpenseWithSingleNumDays)).toEqual('1 Day');
    });

    it('should return vendor details for per diem expense with multiple days', () => {
      expect(service.getVendorDetails(perDiemExpenseWithMultipleNumDays)).toEqual('3 Days');
    });

    it('should return vendor details per diem expense for 0 days', () => {
      expect(service.getVendorDetails({ ...perDiemExpenseWithMultipleNumDays, per_diem_num_days: null })).toContain(
        '0',
      );
    });
  });

  it('getPaymentModeWiseSummary(): should return the payment mode wise summary', () => {
    // @ts-ignore
    spyOn(service, 'getPaymentModeForExpense').and.returnValue({
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
        amount: 20,
        count: 2,
      },
    };

    expect(service.getPaymentModeWiseSummary(expenseResponseData2)).toEqual(summary);
    // @ts-ignore
    expect(service.getPaymentModeForExpense).toHaveBeenCalledWith(expenseResponseData2[0], paymentModes);
    // @ts-ignore
    expect(service.getPaymentModeForExpense).toHaveBeenCalledWith(expenseResponseData2[1], paymentModes);

    // @ts-ignore
    expect(service.getPaymentModeForExpense).toHaveBeenCalledTimes(2);
  });

  it('getCurrenyWiseSummary(): should return the currency wise summary', () => {
    // @ts-ignore
    spyOn(service, 'addExpenseToCurrencyMap').and.callThrough();

    const currencyMap = {
      INR: { name: 'INR', currency: 'INR', amount: 89, origAmount: 89, count: 1 },
      CLF: { name: 'CLF', currency: 'CLF', amount: 33611, origAmount: 12, count: 1 },
      EUR: { name: 'EUR', currency: 'EUR', amount: 15775.76, origAmount: 178, count: 1 },
    };

    expect(service.getCurrenyWiseSummary(expenseResponseData3)).toEqual(currencySummaryData);
    // @ts-ignore
    expect(service.addExpenseToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'INR', 89);
    // @ts-ignore
    expect(service.addExpenseToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'CLF', 33611, 12);
    // @ts-ignore
    expect(service.addExpenseToCurrencyMap).toHaveBeenCalledWith(currencyMap, 'EUR', 15775.76, 178);
    // @ts-ignore
    expect(service.addExpenseToCurrencyMap).toHaveBeenCalledTimes(3);
  });

  it('getPaymentModeForExpense(): should return payment mode for expense', () => {
    spyOn(service, 'isExpenseInPaymentMode').and.returnValue(true);
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
    const expensePaymentMode: { name: string; key: 'reimbursable' | 'nonReimbursable' | 'advance' | 'ccc' } = {
      name: 'Reimbursable',
      key: 'reimbursable',
    };
    // @ts-ignore
    expect(service.getPaymentModeForExpense(expenseData, paymentModeList)).toEqual(expensePaymentMode);
    expect(service.isExpenseInPaymentMode).toHaveBeenCalledOnceWith(
      expenseData.is_reimbursable,
      expenseData.source_account.type,
      expensePaymentMode.key,
    );
  });

  describe('addExpenseToCurrencyMap():', () => {
    it('should add a new currency to the map when the currencyMap does not exist', () => {
      const currencyMap = {};
      const expenseCurrency = 'USD';
      const expenseAmount = 10;
      // @ts-ignore
      service.addExpenseToCurrencyMap(currencyMap, expenseCurrency, expenseAmount);

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
      const expenseCurrency = 'USD';
      const expenseAmount = 10;
      const expenseForeignAmount = 200;
      // @ts-ignore
      service.addExpenseToCurrencyMap(currencyMap, expenseCurrency, expenseAmount, expenseForeignAmount);

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
      const expenseCurrency = 'USD';
      const expenseAmount = 20;
      // @ts-ignore
      service.addExpenseToCurrencyMap(currencyMap, expenseCurrency, expenseAmount);

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
      const expenseCurrency = 'USD';
      const expenseAmount = 20;
      const expenseForeignAmount = 30;
      // @ts-ignore
      service.addExpenseToCurrencyMap(currencyMap, expenseCurrency, expenseAmount, expenseForeignAmount);

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

  describe('isMergeAllowed():', () => {
    it('should not allow merge if number of expenses less than 2', () => {
      const result = service.isMergeAllowed([expenseData]);

      expect(result).toBeFalse();
    });

    it('should allow merge if expenses are 2', () => {
      const result = service.isMergeAllowed(apiExpenses1);

      expect(result).toBeTrue();
    });
  });

  describe('isExpenseInPaymentMode():', () => {
    it('should return isExpenseInPaymentMode with reimbursable payment mode', () => {
      const isExpenseReimbursable = true;
      const expensePaymentMode = 'reimbursable';
      const expenseSourceAccountType = AccountType.PERSONAL_CASH_ACCOUNT;
      expect(
        service.isExpenseInPaymentMode(isExpenseReimbursable, expenseSourceAccountType, expensePaymentMode),
      ).toBeTrue();
    });

    it('should return isExpenseInPaymentMode with non-reimbursable payment mode', () => {
      const isExpenseReimbursable = false;
      const expensePaymentMode = 'nonReimbursable';
      const expenseSourceAccountType = AccountType.PERSONAL_CASH_ACCOUNT;
      expect(
        service.isExpenseInPaymentMode(isExpenseReimbursable, expenseSourceAccountType, expensePaymentMode),
      ).toBeTrue();
    });

    it('should return isExpenseInPaymentMode with advance payment mode', () => {
      const isExpenseReimbursable = true;
      const expensePaymentMode = 'advance';
      const expenseSourceAccountType = AccountType.PERSONAL_ADVANCE_ACCOUNT;
      expect(
        service.isExpenseInPaymentMode(isExpenseReimbursable, expenseSourceAccountType, expensePaymentMode),
      ).toBeTrue();
    });

    it('should return isExpenseInPaymentMode with advance payment mode', () => {
      const isExpenseReimbursable = true;
      const expensePaymentMode = 'ccc';
      const expenseSourceAccountType = AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;
      expect(
        service.isExpenseInPaymentMode(isExpenseReimbursable, expenseSourceAccountType, expensePaymentMode),
      ).toBeTrue();
    });
  });

  describe('getDeleteDialogBody():', () => {
    it('should give dialog body for multiple ccc expenses', () => {
      const result = service.getDeleteDialogBody(2, 2, 'Delete', 'CCC message');

      expect(result.includes('CCC message')).toBeTrue();
    });

    it('should give dialog body for 0 ccc expenses', () => {
      const result = service.getDeleteDialogBody(2, 0, 'Delete', 'CCC message');

      expect(result).toEqual(`<ul class="text-left">
      <li>Delete</li>
      <li>Once deleted, the action can't be reversed.</li>
      </ul>
      <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`);
    });

    it('should give dialog body if 0 expenses to delete', () => {
      const result = service.getDeleteDialogBody(0, 2, 'Delete', 'deleting ccc');

      expect(result).toEqual(`<ul class="text-left">
      <li>deleting ccc</li>
      </ul>`);
    });
  });

  describe('excludeCCCExpenses():', () => {
    it('should exclude ccc expenses', () => {
      const result = service.excludeCCCExpenses([expenseData, mileageExpense]);

      expect(result).toEqual([mileageExpense]);
    });

    it('should exclude expenses without ccc ids', () => {
      const result = service.excludeCCCExpenses([
        { ...expenseData, matched_corporate_card_transaction_ids: null },
        mileageExpense,
      ]);

      expect(result).toEqual([mileageExpense]);
    });
  });

  it('getReportableExpenses(): should get reportable expenese', () => {
    const hasCriticalPolicyViolationSpy = spyOn(service, 'isCriticalPolicyViolatedExpense');
    hasCriticalPolicyViolationSpy.withArgs(expenseData).and.returnValue(false);
    hasCriticalPolicyViolationSpy.withArgs(draftExpense).and.returnValue(false);
    const isExpenseInDraftSpy = spyOn(service, 'isExpenseInDraft');
    isExpenseInDraftSpy.withArgs(expenseData).and.returnValue(false);
    isExpenseInDraftSpy.withArgs(draftExpense).and.returnValue(true);

    const result = service.getReportableExpenses([expenseData, draftExpense]);

    expect(result).toEqual([expenseData]);

    expect(service.isCriticalPolicyViolatedExpense).toHaveBeenCalledTimes(2);
    expect(service.isCriticalPolicyViolatedExpense).toHaveBeenCalledWith(expenseData);
    expect(service.isCriticalPolicyViolatedExpense).toHaveBeenCalledWith(draftExpense);
    expect(service.isExpenseInDraft).toHaveBeenCalledTimes(2);
    expect(service.isExpenseInDraft).toHaveBeenCalledWith(expenseData);
    expect(service.isExpenseInDraft).toHaveBeenCalledWith(draftExpense);
  });

  describe('getExpenseDeletionMessage():', () => {
    it('should get delete message for a single expense', () => {
      const result = service.getExpenseDeletionMessage([expenseData]);

      expect(result).toEqual('You are about to permanently delete 1 selected expense.');
    });

    it('should get delete message for multiple expense', () => {
      const result = service.getExpenseDeletionMessage([expenseData, draftExpense]);

      expect(result).toEqual('You are about to permanently delete 2 selected expenses.');
    });
  });

  describe('getCCCExpenseMessage():', () => {
    it('should get ccc message for 1 expense', () => {
      const result = service.getCCCExpenseMessage([expenseData, mileageExpense], 1);

      expect(result).toEqual(
        `There is 1 corporate card expense from the selection which can't be deleted. However you can delete the other expenses from the selection.`,
      );
    });

    it('should get ccc message for multiple expenses', () => {
      const result = service.getCCCExpenseMessage([expenseData, mileageExpense], 2);

      expect(result).toEqual(
        `There are 2 corporate card expenses from the selection which can't be deleted. However you can delete the other expenses from the selection.`,
      );
    });

    it('should get ccc message for 0 expenses', () => {
      const result = service.getCCCExpenseMessage([], 0);

      expect(result).toEqual(`There is 0 corporate card expense from the selection which can't be deleted.`);
    });
  });

  describe('generateCardNumberParams(): ', () => {
    it('should generate card number params', () => {
      const result = service.generateCardNumberParams({}, expenseFiltersData1);

      expect(result).toEqual({
        'matched_corporate_card_transactions->0->corporate_card_number': 'in.("1234","5678")',
      });
    });

    it('should return empty params if no card numbers in filters', () => {
      const result = service.generateCardNumberParams({}, expenseFiltersDataWoCards);

      expect(result).toEqual({});
    });
  });

  //Commenting for now, will fix later
  describe('generateDateParams():', () => {
    it('should generate date params for filters this week', () => {
      const result = service.generateDateParams({}, cloneDeep(expenseFiltersData1));
      spyOn(service, 'generateCustomDateParams');

      // expect(result).toEqual({
      //   and: '(spent_at.gte.2023-12-02T18:30:00.000Z,spent_at.lt.2023-12-09T18:30:00.000Z)',
      // });
    });

    it('should generate date params for filters this month', () => {
      const result = service.generateDateParams({}, cloneDeep(expenseFiltersDataMonth));
      spyOn(service, 'generateCustomDateParams');

      // expect(result).toEqual({
      //   and: '(spent_at.gte.2023-11-30T18:30:00.000Z,spent_at.lt.2023-12-31T18:29:00.000Z)',
      // });
    });

    it('should generate date params for filters last month', () => {
      const result = service.generateDateParams({}, cloneDeep(expenseFiltersDataLastMonth));
      spyOn(service, 'generateCustomDateParams');

      // expect(result).toEqual({
      //   and: '(spent_at.gte.2023-10-31T18:30:00.000Z,spent_at.lt.2023-11-30T18:29:00.000Z)',
      // });
    });

    it('should generate custom date params', () => {
      const result = service.generateDateParams({}, cloneDeep(expenseFiltersDataWCustom));
      spyOn(service, 'generateCustomDateParams').and.returnValue({
        and: '(spent_at.gte.2023-01-04T00:00:00.000Z,spent_at.lt.2023-01-10T00:00:00.000Z)',
      });

      expect(result).toEqual({
        and: '(spent_at.gte.2023-01-04T00:00:00.000Z,spent_at.lt.2023-01-10T00:00:00.000Z)',
      });
    });
  });

  describe('generateCustomDateParams():', () => {
    it('should generate params for custom date with both start and end', () => {
      const result = service.generateCustomDateParams({}, expenseFiltersDataWCustom);

      expect(result).toEqual({
        and: '(spent_at.gte.2023-01-04T00:00:00.000Z,spent_at.lt.2023-01-10T00:00:00.000Z)',
      });
    });

    it('should generate params for custom date with only start', () => {
      const result = service.generateCustomDateParams({}, expenseFiltersDataWithCustomStart);

      expect(result).toEqual({
        and: '(spent_at.gte.2023-01-04T00:00:00.000Z)',
      });
    });

    it('should generate params for custom date with only end', () => {
      const result = service.generateCustomDateParams({}, expenseFiltersDataWithCustomEnd);

      expect(result).toEqual({
        and: '(spent_at.lt.2023-01-10T00:00:00.000Z)',
      });
    });
  });

  describe('generateReceiptAttachedParams():', () => {
    it('should generate params for receipts', () => {
      const result = service.generateReceiptAttachedParams({}, expenseFiltersData1);

      expect(result).toEqual({
        file_ids: 'not_like.[]',
      });
    });

    it('should generate params for excluding receipts', () => {
      const result = service.generateReceiptAttachedParams({}, expenseFiltersDataWoReceipts);

      expect(result).toEqual({
        file_ids: 'like.[]',
      });
    });
  });

  describe('generatePotentialDuplicatesParams():', () => {
    it('should generate params for potential duplicates expenses ', () => {
      const result = service.generatePotentialDuplicatesParams({}, expenseWithPotentialDuplicateFilterData);

      expect(result).toEqual({
        is_duplicate_present: 'eq.true',
      });
    });

    it('should generate params for non-potential duplicate expenses', () => {
      const result = service.generatePotentialDuplicatesParams({}, expenseWithoutPotentialDuplicateFilterData);

      expect(result).toEqual({
        is_duplicate_present: 'eq.false',
      });
    });
  });

  describe('generateStateFilters():', () => {
    it('should generate state filter', () => {
      spyOn(service, 'generateStateOrFilter').and.returnValue([
        'and(state.in.(COMPLETE),or(policy_amount.is.null,policy_amount.gt.0.0001))',
        'and(is_policy_flagged.eq.true,or(policy_amount.is.null,policy_amount.gt.0.0001))',
        'policy_amount.lt.0.0001',
        'state.in.(DRAFT)',
      ]);

      const result = service.generateStateFilters({}, expenseFiltersDataAllStates);

      expect(result).toEqual({
        or: [
          '(and(state.in.(COMPLETE),or(policy_amount.is.null,policy_amount.gt.0.0001)), and(is_policy_flagged.eq.true,or(policy_amount.is.null,policy_amount.gt.0.0001)), policy_amount.lt.0.0001, state.in.(DRAFT))',
        ],
      });
    });
  });

  describe('generateStateOrFilter():', () => {
    it('should get state order filter for all type of expenses', () => {
      const result = service.generateStateOrFilter(expenseFiltersDataAllStates, {});

      expect(result).toEqual([
        'and(state.in.(COMPLETE),or(policy_amount.is.null,policy_amount.gt.0.0001))',
        'and(is_policy_flagged.eq.true,or(policy_amount.is.null,policy_amount.gt.0.0001))',
        'state.in.(UNREPORTABLE)',
        'policy_amount.lt.0.0001',
        'state.in.(DRAFT)',
      ]);
    });
  });

  describe('generateTypeOrFilter():', () => {
    it('should generate type filters for all expenses', () => {
      const result = service.generateTypeFilters({}, expenseFiltersDataWCustom);

      expect(result).toEqual({
        or: [
          '(category->system_category.eq.Mileage, category->system_category.eq.Per Diem, category->system_category.not_in.(Mileage,Per Diem))',
        ],
      });
    });
  });

  describe('setSortParams():', () => {
    it('should get sort params if specified', () => {
      const result = service.setSortParams({}, expenseFiltersData1);

      expect(result).toEqual({
        sortParam: 'category->name',
        sortDir: 'asc',
      });
    });

    it('should get sort params if not specified', () => {
      const result = service.setSortParams({}, expenseFiltersDataWoSplit);

      expect(result).toEqual({
        sortParam: 'spent_at',
        sortDir: 'desc',
      });
    });
  });

  it('generateStatsQueryParams(): should generate stats query params', () => {
    const queryParams = {
      state: 'in.(COMPLETE)',
      report_id: 'is.null',
      or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
    };

    const result = service.generateStatsQueryParams(queryParams);
    expect(result).toEqual('state=in.(COMPLETE)&report_id=is.null&or=(policy_amount.is.null,policy_amount.gt.0.0001)');
  });

  describe('generateSplitExpenseParams():', () => {
    it('should generate params for split expense', () => {
      const result = service.generateSplitExpenseParams({}, expenseFiltersData1);

      expect(result).toEqual({
        or: ['(is_split.eq.true)'],
      });
    });

    it('should generate params for excluding split expense', () => {
      const result = service.generateSplitExpenseParams({}, expenseFiltersDataWoSplit);

      expect(result).toEqual({
        or: ['(is_split.eq.false)'],
      });
    });

    describe('isPendingGasCharge():', () => {
      it('should return true for valid pending gas charge expense', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeTrue();
      });

      it('should return true for valid pending gas charge expense with CAD currency', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Gasoline',
          code: 'GAS',
          display_name: 'Gasoline',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1.0;
        expense.currency = 'CAD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeTrue();
      });

      it('should return false when expense is not fuel category', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Food',
          code: 'FOOD',
          display_name: 'Food',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should return false when amount is not 1 dollar', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 2;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should return false when currency is not USD or CAD', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'EUR';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should return false when transaction status is not pending', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.POSTED },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should return false when expense has receipts', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = ['file1'];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should return false when expense is not matched with corporate card', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = [];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should return false when expense has no matched corporate card transactions', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should handle missing category gracefully', () => {
        const expense = cloneDeep(expenseData);
        expense.category = null;
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should handle missing category name gracefully', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: null,
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = [
          { ...expenseData.matched_corporate_card_transactions[0], status: ExpenseTransactionStatus.PENDING },
        ];
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should handle missing matched corporate card transactions gracefully', () => {
        const expense = cloneDeep(expenseData);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.matched_corporate_card_transactions = null;
        expense.matched_corporate_card_transaction_ids = ['transaction1'];
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeFalse();
      });

      it('should handle missing file_ids gracefully', () => {
        const expense = cloneDeep(platformExpenseDataWithPendingGasCharge);
        expense.category = {
          id: 1,
          name: 'Fuel',
          code: 'FUEL',
          display_name: 'Fuel',
          sub_category: null,
          system_category: null,
        };
        expense.amount = 1;
        expense.currency = 'USD';
        expense.file_ids = [];

        const result = service.isPendingGasCharge(expense);
        expect(result).toBeTrue();
      });
    });
  });
});
