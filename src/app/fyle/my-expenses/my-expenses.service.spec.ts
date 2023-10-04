import { TestBed } from '@angular/core/testing';
import { MyExpensesService } from './my-expenses.service';
import {
  expenseFiltersData1,
  expenseFiltersData3,
  expenseFiltersData4,
  expenseFiltersData5,
} from 'src/app/core/mock-data/expense-filters.data';
import { creditTxnFilterPill } from 'src/app/core/mock-data/filter-pills.data';
import { selectedFilters7, selectedFilters8 } from 'src/app/core/mock-data/selected-filters.data';

fdescribe('MyExpensesService', () => {
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
      myExpensesService.generateSortAmountPills(expenseFiltersData5, []);
    });
  });
});
