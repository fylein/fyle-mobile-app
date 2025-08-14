import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MyExpensesService } from './my-expenses.service';
import {
  expenseFiltersData1,
  expenseFiltersData3,
  expenseFiltersData4,
  expenseFiltersData5,
  expenseFiltersData6,
  expenseWithPotentialDuplicateFilterData,
} from 'src/app/core/mock-data/expense-filters.data';
import {
  cardFilterPill,
  creditTxnFilterPill,
  expectedDateFilterPill,
  expectedFilterPill2,
  potentialDuplicatesFilterPill,
  receiptsAttachedFilterPill,
  sortByAscFilterPill,
  sortByDateAscFilterPill,
  sortByDateDescFilterPill,
  sortByDescFilterPill,
  sortFilterPill,
  splitExpenseFilterPill,
  stateFilterPill2,
} from 'src/app/core/mock-data/filter-pills.data';
import { selectedFilters7, selectedFilters8, selectedFilters9 } from 'src/app/core/mock-data/selected-filters.data';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import {
  expectedFilterPill3,
  expectedFilterPill4,
  expectedFilterPill5,
  expectedFilterPill6,
  expectedFilterPill7,
  expectedFilterPill8,
  expectedFilterPill9,
} from 'src/app/core/mock-data/my-reports-filterpills.data';
import { filter1, filter2 } from 'src/app/core/mock-data/my-reports-filters.data';
import { filterOptions2 } from 'src/app/core/mock-data/filter-options.data';
import { ExpenseType } from 'src/app/core/enums/expense-type.enum';
import { TranslocoService } from '@jsverse/transloco';
describe('MyExpensesService', () => {
  let myExpensesService: MyExpensesService;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.myExpenses.sortBy': 'Sort by',
        'services.myExpenses.amountHighToLowPill': 'amount - high to low',
        'services.myExpenses.amountLowToHighPill': 'amount - low to high',
        'services.myExpenses.dateOldToNewPill': 'date - old to new',
        'services.myExpenses.dateNewToOldPill': 'date - new to old',
        'services.myExpenses.regularExpenses': 'Regular Expenses',
        'services.myExpenses.perDiem': 'Per Diem',
        'services.myExpenses.mileage': 'Mileage',
        'services.myExpenses.expenseType': 'Expense type',
        'services.myExpenses.date': 'Date',
        'services.myExpenses.thisWeekPill': 'this Week',
        'services.myExpenses.thisMonthPill': 'this Month',
        'services.myExpenses.lastMonthPill': 'Last Month',
        'services.myExpenses.all': 'All',
        'services.myExpenses.to': ' to ',
        'services.myExpenses.greaterThanOrEqual': '>= ',
        'services.myExpenses.lessThanOrEqual': '<= ',
        'services.myExpenses.receiptsAttached': 'Receipts attached',
        'services.myExpenses.potentialDuplicates': 'Potential duplicates',
        'services.myExpenses.splitExpense': 'Split expense',
        'services.myExpenses.cardsEndingIn': 'Cards ending in...',
        'services.myExpenses.type': 'Type',
        'services.myExpenses.incomplete': 'Incomplete',
        'services.myExpenses.complete': 'Complete',
        'services.myExpenses.thisWeek': 'This Week',
        'services.myExpenses.thisMonth': 'This Month',
        'services.myExpenses.lastMonth': 'Last Month',
        'services.myExpenses.custom': 'Custom',
        'services.myExpenses.yes': 'Yes',
        'services.myExpenses.no': 'No',
        'services.myExpenses.policyViolated': 'Policy violated',
        'services.myExpenses.cannotReport': 'Cannot Report',
        'services.myExpenses.blocked': 'Blocked',
        'services.myExpenses.dateNewToOldSort': 'Date - New to Old',
        'services.myExpenses.dateOldToNewSort': 'Date - Old to New',
        'services.myExpenses.amountHighToLowSort': 'Amount - High to Low',
        'services.myExpenses.amountLowToHighSort': 'Amount - Low to High',
        'services.myExpenses.categoryAToZSort': 'Category - A to Z',
        'services.myExpenses.categoryZToASort': 'Category - Z to A',
        'services.myExpenses.categoryAToZPill': 'category - a to z',
        'services.myExpenses.categoryZToAPill': 'category - z to a',
        'services.myExpenses.policyViolatedPill': 'policy violated',
        'services.myExpenses.cannotReportPill': 'cannot report',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyExpensesService, { provide: TranslocoService, useValue: translocoServiceSpy }],
    });

    myExpensesService = TestBed.inject(MyExpensesService);
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(myExpensesService).toBeTruthy();
  });

  it('generateSortFilterPills(): should call generateSortTxnDatePills, generateSortAmountPills and generateSortCategoryPills once', () => {
    spyOn(myExpensesService, 'generateSortTxnDatePills');
    spyOn(myExpensesService, 'generateSortAmountPills');
    //@ts-ignore
    spyOn(myExpensesService, 'generateSortCategoryPills');

    myExpensesService.generateSortFilterPills(expenseFiltersData1, creditTxnFilterPill);

    expect(myExpensesService.generateSortTxnDatePills).toHaveBeenCalledTimes(1);
    expect(myExpensesService.generateSortAmountPills).toHaveBeenCalledTimes(1);
    //@ts-ignore
    expect(myExpensesService.generateSortCategoryPills).toHaveBeenCalledTimes(1);
  });

  describe('covertFilters():', () => {
    it('should modify the selected filters and return the generated filter', () => {
      spyOn(myExpensesService, 'convertSelectedSortFitlersToFilters');
      const sortBy = { name: 'Sort by', value: 'dateNewToOld' };

      const convertedFilters = myExpensesService.convertSelectedOptionsToExpenseFilters(selectedFilters7);

      expect(myExpensesService.convertSelectedSortFitlersToFilters).toHaveBeenCalledOnceWith(
        sortBy,
        expenseFiltersData3,
      );

      expect(convertedFilters).toEqual(expenseFiltersData3);
    });

    it('should set customDateStart and customDateEnd as undefined if associated data is undefined', () => {
      spyOn(myExpensesService, 'convertSelectedSortFitlersToFilters');
      const sortBy = { name: 'Sort by', value: 'dateNewToOld' };

      const convertedFilters = myExpensesService.convertSelectedOptionsToExpenseFilters(selectedFilters8);

      expect(myExpensesService.convertSelectedSortFitlersToFilters).toHaveBeenCalledOnceWith(
        sortBy,
        expenseFiltersData4,
      );

      expect(convertedFilters).toEqual(expenseFiltersData4);
    });
  });

  describe('generateSortAmountPills():', () => {
    it('should add amount - high to low as sort params if sort direction is decreasing', () => {
      const filterPill = [];
      myExpensesService.generateSortAmountPills(expenseFiltersData5, filterPill);
      expect(filterPill).toEqual(sortByDescFilterPill);
    });

    it('should add amount - low to high as sort params if sort direction is ascending', () => {
      const filterPill = [];
      myExpensesService.generateSortAmountPills({ ...expenseFiltersData5, sortDir: 'asc' }, filterPill);
      expect(filterPill).toEqual(sortByAscFilterPill);
    });
  });

  describe('generateSortTxnDatePills():', () => {
    it('should add date - old to new as sort params if sort direction is ascending', () => {
      const filterPill = [];
      myExpensesService.generateSortTxnDatePills(expenseFiltersData6, filterPill);
      expect(filterPill).toEqual(sortByDateAscFilterPill);
    });

    it('should add date - new to old as sort params if sort direction is descending', () => {
      const filterPill = [];
      myExpensesService.generateSortTxnDatePills({ ...expenseFiltersData6, sortDir: 'desc' }, filterPill);
      expect(filterPill).toEqual(sortByDateDescFilterPill);
    });
  });

  it('generateTypeFilterPills(): should add combined expense types value in filter pills', () => {
    const filterPill = [];
    myExpensesService.generateTypeFilterPills(
      { ...expenseFiltersData1, type: [ExpenseType.EXPENSE, ExpenseType.PER_DIEM, ExpenseType.MILEAGE, 'custom'] },
      filterPill,
    );
    expect(filterPill).toEqual([
      { label: 'Expense type', type: 'type', value: 'Regular Expenses, Per Diem, Mileage, custom' },
    ]);
  });

  describe('generateDateFilterPills(): ', () => {
    it('should generate filter pill for "this Week"', () => {
      const filter = {
        date: DateFilters.thisWeek,
      };

      const res = myExpensesService.generateDateFilterPills(filter, []);

      expect(res).toEqual(expectedFilterPill5);
    });

    it('should generate filter pill for "this Month"', () => {
      const filter = {
        date: DateFilters.thisMonth,
      };

      const res = myExpensesService.generateDateFilterPills(filter, []);

      expect(res).toEqual(expectedFilterPill6);
    });

    it('should generate filter pill for "All"', () => {
      const filter = {
        date: DateFilters.all,
      };

      const res = myExpensesService.generateDateFilterPills(filter, []);

      expect(res).toEqual(expectedFilterPill7);
    });

    it('should generate filter pill for "Last Month"', () => {
      const filter = {
        date: DateFilters.lastMonth,
      };

      const res = myExpensesService.generateDateFilterPills(filter, []);

      expect(res).toEqual(expectedFilterPill8);
    });

    it('should generate custom date filter pill', () => {
      const filter = filter2;
      spyOn(myExpensesService, 'generateCustomDatePill').and.returnValue(expectedFilterPill9);

      const res = myExpensesService.generateDateFilterPills(filter, []);

      expect(myExpensesService.generateCustomDatePill).toHaveBeenCalledOnceWith(filter, []);

      expect(res).toEqual(expectedFilterPill9);
    });
  });

  describe('generateCustomDatePill(): ', () => {
    it('should generate custom date filter pill with start and end date', () => {
      const filter = {
        customDateStart: new Date('2023-01-21'),
        customDateEnd: new Date('2023-01-31'),
      };

      const res = myExpensesService.generateCustomDatePill(filter, []);

      expect(res).toEqual(expectedDateFilterPill);
    });

    it('should generate custom date filter pill with only start date', () => {
      const filter = {
        customDateStart: new Date('2023-01-21'),
        customDateEnd: null,
      };

      const res = myExpensesService.generateCustomDatePill(filter, []);

      expect(res).toEqual(expectedFilterPill3);
    });

    it('should generate custom date filter pill with only end date', () => {
      const filter = {
        customDateStart: null,
        customDateEnd: new Date('2023-01-31'),
      };

      const res = myExpensesService.generateCustomDatePill(filter, []);

      expect(res).toEqual(expectedFilterPill4);
    });

    it('should not generate custom date filter pill if start and end date are null', () => {
      const filter = {
        customDateStart: null,
        customDateEnd: null,
      };

      const res = myExpensesService.generateCustomDatePill(filter, []);

      expect(res).toEqual([]);
    });
  });

  it('generateReceiptsAttachedFilterPills(): should add receipt attached filter pill', () => {
    const filterPill = [];
    myExpensesService.generateReceiptsAttachedFilterPills(filterPill, expenseFiltersData1);
    expect(filterPill).toEqual([receiptsAttachedFilterPill]);
  });

  it('generatePotentialDuplicatesFilterPills(): should add potential duplicates filter pill', () => {
    const filterPill = [];
    myExpensesService.generatePotentialDuplicatesFilterPills(filterPill, expenseWithPotentialDuplicateFilterData);
    expect(filterPill).toEqual([potentialDuplicatesFilterPill]);
  });

  it('generateSplitExpenseFilterPills(): should add split expense filter pill', () => {
    const filterPill = [];
    myExpensesService.generateSplitExpenseFilterPills(filterPill, expenseFiltersData1);
    expect(filterPill).toEqual([splitExpenseFilterPill]);
  });

  it('generateCardFilterPills(): should add card filter pill', () => {
    const filterPill = [];
    myExpensesService.generateCardFilterPills(filterPill, expenseFiltersData1);
    expect(filterPill).toEqual([cardFilterPill]);
  });

  it('generateStateFilterPills(): should add state filter pill', () => {
    const state = ['DRAFT', 'READY_TO_REPORT', 'APPROVED'];
    const filterPill = [];
    myExpensesService.generateStateFilterPills(filterPill, { ...expenseFiltersData1, state });
    expect(filterPill).toEqual([stateFilterPill2]);
  });

  describe('convertSelectedSortFiltersToFilters(): ', () => {
    it('should convert selected sort filter to corresponding sortParam and sortDir', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'dateNewToOld',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'spent_at',
        sortDir: 'desc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (dateOldToNew)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'dateOldToNew',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'spent_at',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (amountHighToLow)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'amountHighToLow',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'amount',
        sortDir: 'desc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (amountLowToHigh)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'amountLowToHigh',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'amount',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (nameAToZ)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'categoryAToZ',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'category->name',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (nameZToA)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'categoryZToA',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'category->name',
        sortDir: 'desc',
      });
    });
  });

  it('getFilters(): should return all the filters', () => {
    const orgSettings = { is_new_critical_policy_violation_flow_enabled: true };
    const filters = myExpensesService.getFilters(orgSettings);

    expect(filters).toEqual(filterOptions2);
  });

  it('generateSelectedFilters(): should generate selected filters', () => {
    spyOn(myExpensesService, 'addSortToGeneratedFilters');

    const filters = myExpensesService.generateSelectedFilters(expenseFiltersData1);

    expect(myExpensesService.addSortToGeneratedFilters).toHaveBeenCalledOnceWith(expenseFiltersData1, filters);

    expect(filters).toEqual(selectedFilters9);
  });

  it('addSortToGeneratedFilters(): should call convertTxnDtSortToSelectedFilters, convertAmountSortToSelectedFilters and convertCategorySortToSelectedFilters once', () => {
    spyOn(myExpensesService, 'convertTxnDtSortToSelectedFilters');
    spyOn(myExpensesService, 'convertAmountSortToSelectedFilters');
    spyOn(myExpensesService, 'convertCategorySortToSelectedFilters');

    myExpensesService.addSortToGeneratedFilters(expenseFiltersData1, selectedFilters9);

    expect(myExpensesService.convertTxnDtSortToSelectedFilters).toHaveBeenCalledOnceWith(
      expenseFiltersData1,
      selectedFilters9,
    );
    expect(myExpensesService.convertAmountSortToSelectedFilters).toHaveBeenCalledOnceWith(
      expenseFiltersData1,
      selectedFilters9,
    );
    expect(myExpensesService.convertCategorySortToSelectedFilters).toHaveBeenCalledOnceWith(
      expenseFiltersData1,
      selectedFilters9,
    );
  });

  describe('convertCategorySortToSelectedFilters():', () => {
    it('should add categoryAToZ sort params if sort direction is ascending', () => {
      const generatedFilters = [];

      myExpensesService.convertCategorySortToSelectedFilters(expenseFiltersData1, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'categoryAToZ',
        },
      ]);
    });

    it('should add categoryZToA sort params if sort direction is descending', () => {
      const generatedFilters = [];

      myExpensesService.convertCategorySortToSelectedFilters(
        { ...expenseFiltersData1, sortDir: 'desc' },
        generatedFilters,
      );

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'categoryZToA',
        },
      ]);
    });
  });

  describe('convertAmountSortToSelectedFilters(): ', () => {
    it('should convert amount sort to selected filters for descending sort', () => {
      const filter = {
        sortParam: 'amount',
        sortDir: 'desc',
      };
      const generatedFilters = [];

      myExpensesService.convertAmountSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'amountHighToLow',
        },
      ]);
    });

    it('should convert amount sort to selected filters for ascending sort', () => {
      const filter = {
        sortParam: 'amount',
        sortDir: 'asc',
      };
      const generatedFilters = [];

      myExpensesService.convertAmountSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'amountLowToHigh',
        },
      ]);
    });
  });

  describe('convertTxnDtSortToSelectedFilters():', () => {
    it('should covert txn date sort to selected filters for descending sort', () => {
      const filter = {
        sortParam: 'spent_at',
        sortDir: 'desc',
      };
      const generatedFilters = [];

      myExpensesService.convertTxnDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'dateNewToOld',
        },
      ]);
    });

    it('should covert txn date sort to selected filters for ascending sort', () => {
      const filter = {
        sortParam: 'spent_at',
        sortDir: 'asc',
      };
      const generatedFilters = [];

      myExpensesService.convertTxnDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'dateOldToNew',
        },
      ]);
    });
  });

  describe('generateSortCategoryPills():', () => {
    it('should add category - a to z as sort params if sort direction is ascending', () => {
      const filter = {
        sortParam: 'category->name',
        sortDir: 'asc',
      };
      const filterPill = [];

      //@ts-ignore
      myExpensesService.generateSortCategoryPills(filter, filterPill);

      expect(filterPill).toEqual([sortFilterPill]);
    });

    it('should add category - z to a as sort params if sort direction is descending', () => {
      const filter = {
        sortParam: 'category->name',
        sortDir: 'desc',
      };
      const filterPill = [];

      //@ts-ignore
      myExpensesService.generateSortCategoryPills(filter, filterPill);

      expect(filterPill).toEqual([{ ...sortFilterPill, value: 'category - z to a' }]);
    });
  });
});
