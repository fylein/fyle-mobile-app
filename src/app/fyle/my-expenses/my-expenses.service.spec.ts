import { TestBed } from '@angular/core/testing';
import { MyExpensesService } from './my-expenses.service';
import {
  expenseFiltersData1,
  expenseFiltersData1Old,
  expenseFiltersData3,
  expenseFiltersData4,
  expenseFiltersData5,
  expenseFiltersData5Old,
  expenseFiltersData6,
  expenseFiltersData7,
} from 'src/app/core/mock-data/expense-filters.data';
import {
  cardFilterPill,
  creditTxnFilterPill,
  expectedDateFilterPill,
  expectedFilterPill2,
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
import { filterOptions2, filterOptions3 } from 'src/app/core/mock-data/filter-options.data';

describe('MyExpensesService', () => {
  let myExpensesService: MyExpensesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyExpensesService],
    });

    myExpensesService = TestBed.inject(MyExpensesService);
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
      const sortBy = { name: 'Sort By', value: 'dateNewToOld' };

      const convertedFilters = myExpensesService.convertFilters(selectedFilters7);

      expect(myExpensesService.convertSelectedSortFitlersToFilters).toHaveBeenCalledOnceWith(
        sortBy,
        expenseFiltersData3
      );

      expect(convertedFilters).toEqual(expenseFiltersData3);
    });

    it('should set customDateStart and customDateEnd as undefined if associated data is undefined', () => {
      spyOn(myExpensesService, 'convertSelectedSortFitlersToFilters');
      const sortBy = { name: 'Sort By', value: 'dateNewToOld' };

      const convertedFilters = myExpensesService.convertFilters(selectedFilters8);

      expect(myExpensesService.convertSelectedSortFitlersToFilters).toHaveBeenCalledOnceWith(
        sortBy,
        expenseFiltersData4
      );

      expect(convertedFilters).toEqual(expenseFiltersData4);
    });
  });

  describe('generateSortAmountPills():', () => {
    it('should add amount - high to low as sort params if sort direction is decreasing', () => {
      const filterPill = [];
      myExpensesService.generateSortAmountPills(expenseFiltersData5Old, filterPill);
      expect(filterPill).toEqual(sortByDescFilterPill);
    });

    it('should add amount - low to high as sort params if sort direction is ascending', () => {
      const filterPill = [];
      myExpensesService.generateSortAmountPills({ ...expenseFiltersData5Old, sortDir: 'asc' }, filterPill);
      expect(filterPill).toEqual(sortByAscFilterPill);
    });
  });

  describe('generateSortTxnDatePills():', () => {
    it('should add date - old to new as sort params if sort direction is ascending', () => {
      const filterPill = [];
      myExpensesService.generateSortTxnDatePills(expenseFiltersData7, filterPill);
      expect(filterPill).toEqual(sortByDateAscFilterPill);
    });

    it('should add date - new to old as sort params if sort direction is descending', () => {
      const filterPill = [];
      myExpensesService.generateSortTxnDatePills({ ...expenseFiltersData7, sortDir: 'desc' }, filterPill);
      expect(filterPill).toEqual(sortByDateDescFilterPill);
    });
  });

  it('generateTypeFilterPills(): should add combined expense types value in filter pills', () => {
    const filterPill = [];
    myExpensesService.generateTypeFilterPills(
      { ...expenseFiltersData1, type: ['RegularExpenses', 'PerDiem', 'Mileage', 'custom'] },
      filterPill
    );
    expect(filterPill).toEqual([
      { label: 'Expense Type', type: 'type', value: 'Regular Expenses, Per Diem, Mileage, custom' },
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
        name: 'Sort By',
        value: 'dateNewToOld',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'tx_txn_dt',
        sortDir: 'desc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (dateOldToNew)', () => {
      const sortBy = {
        name: 'Sort By',
        value: 'dateOldToNew',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'tx_txn_dt',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (amountHighToLow)', () => {
      const sortBy = {
        name: 'Sort By',
        value: 'amountHighToLow',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'tx_amount',
        sortDir: 'desc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (amountLowToHigh)', () => {
      const sortBy = {
        name: 'Sort By',
        value: 'amountLowToHigh',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'tx_amount',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (nameAToZ)', () => {
      const sortBy = {
        name: 'Sort By',
        value: 'categoryAToZ',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'tx_org_category',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (nameZToA)', () => {
      const sortBy = {
        name: 'Sort By',
        value: 'categoryZToA',
      };
      const generatedFilters = {};

      myExpensesService.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'tx_org_category',
        sortDir: 'desc',
      });
    });
  });

  it('getFilters(): should return all the filters', () => {
    const filters = myExpensesService.getFilters();

    expect(filters).toEqual(filterOptions3);
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
      selectedFilters9
    );
    expect(myExpensesService.convertAmountSortToSelectedFilters).toHaveBeenCalledOnceWith(
      expenseFiltersData1,
      selectedFilters9
    );
    expect(myExpensesService.convertCategorySortToSelectedFilters).toHaveBeenCalledOnceWith(
      expenseFiltersData1,
      selectedFilters9
    );
  });

  describe('convertCategorySortToSelectedFilters():', () => {
    it('should add categoryAToZ sort params if sort direction is ascending', () => {
      const generatedFilters = [];

      myExpensesService.convertCategorySortToSelectedFilters(expenseFiltersData1Old, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort By',
          value: 'categoryAToZ',
        },
      ]);
    });

    it('should add categoryZToA sort params if sort direction is descending', () => {
      const generatedFilters = [];

      myExpensesService.convertCategorySortToSelectedFilters(
        { ...expenseFiltersData1Old, sortDir: 'desc' },
        generatedFilters
      );

      expect(generatedFilters).toEqual([
        {
          name: 'Sort By',
          value: 'categoryZToA',
        },
      ]);
    });
  });

  describe('convertAmountSortToSelectedFilters(): ', () => {
    it('should convert amount sort to selected filters for descending sort', () => {
      const filter = {
        sortParam: 'tx_amount',
        sortDir: 'desc',
      };
      const generatedFilters = [];

      myExpensesService.convertAmountSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort By',
          value: 'amountHighToLow',
        },
      ]);
    });

    it('should convert amount sort to selected filters for ascending sort', () => {
      const filter = {
        sortParam: 'tx_amount',
        sortDir: 'asc',
      };
      const generatedFilters = [];

      myExpensesService.convertAmountSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort By',
          value: 'amountLowToHigh',
        },
      ]);
    });
  });

  describe('convertTxnDtSortToSelectedFilters():', () => {
    it('should covert txn date sort to selected filters for descending sort', () => {
      const filter = {
        sortParam: 'tx_txn_dt',
        sortDir: 'desc',
      };
      const generatedFilters = [];

      myExpensesService.convertTxnDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort By',
          value: 'dateNewToOld',
        },
      ]);
    });

    it('should covert txn date sort to selected filters for ascending sort', () => {
      const filter = {
        sortParam: 'tx_txn_dt',
        sortDir: 'asc',
      };
      const generatedFilters = [];

      myExpensesService.convertTxnDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort By',
          value: 'dateOldToNew',
        },
      ]);
    });
  });

  describe('generateSortCategoryPills():', () => {
    it('should add category - a to z as sort params if sort direction is ascending', () => {
      const filter = {
        sortParam: 'tx_org_category',
        sortDir: 'asc',
      };
      const filterPill = [];

      //@ts-ignore
      myExpensesService.generateSortCategoryPills(filter, filterPill);

      expect(filterPill).toEqual([sortFilterPill]);
    });

    it('should add category - z to a as sort params if sort direction is descending', () => {
      const filter = {
        sortParam: 'tx_org_category',
        sortDir: 'desc',
      };
      const filterPill = [];

      //@ts-ignore
      myExpensesService.generateSortCategoryPills(filter, filterPill);

      expect(filterPill).toEqual([{ ...sortFilterPill, value: 'category - z to a' }]);
    });
  });
});
