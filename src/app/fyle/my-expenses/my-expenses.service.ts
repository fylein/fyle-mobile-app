import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { Filters } from './my-expenses-filters.model';

@Injectable()
export class MyExpensesService {
  maskNumber = new MaskNumber();

  generateSortFilterPills(filter, filterPills: FilterPill[]) {
    this.generateSortTxnDatePills(filter, filterPills);

    this.generateSortAmountPills(filter, filterPills);

    this.generateSortCategoryPills(filter, filterPills);
  }

  convertFilters(selectedFilters: SelectedFilters<any>[]): Filters {
    const generatedFilters: Filters = {};

    const typeFilter = selectedFilters.find((filter) => filter.name === 'Type');
    if (typeFilter) {
      generatedFilters.state = typeFilter.value;
    }

    const dateFilter = selectedFilters.find((filter) => filter.name === 'Date');
    if (dateFilter) {
      generatedFilters.date = dateFilter.value;
      generatedFilters.customDateStart = dateFilter.associatedData?.startDate;
      generatedFilters.customDateEnd = dateFilter.associatedData?.endDate;
    }

    const receiptAttachedFilter = selectedFilters.find((filter) => filter.name === 'Receipts Attached');

    if (receiptAttachedFilter) {
      generatedFilters.receiptsAttached = receiptAttachedFilter.value;
    }

    const expenseTypeFilter = selectedFilters.find((filter) => filter.name === 'Expense Type');

    if (expenseTypeFilter) {
      generatedFilters.type = expenseTypeFilter.value;
    }

    const cardsFilter = selectedFilters.find((filter) => filter.name === 'Cards');

    if (cardsFilter) {
      generatedFilters.cardNumbers = cardsFilter.value;
    }

    const sortBy = selectedFilters.find((filter) => filter.name === 'Sort By');

    this.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

    return generatedFilters;
  }

  generateSortAmountPills(filter: Filters, filterPills: FilterPill[]) {
    if (filter.sortParam === 'tx_amount' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'amount - high to low',
      });
    } else if (filter.sortParam === 'tx_amount' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'amount - low to high',
      });
    }
  }

  generateSortTxnDatePills(filter: Filters, filterPills: FilterPill[]) {
    if (filter.sortParam === 'tx_txn_dt' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'date - old to new',
      });
    } else if (filter.sortParam === 'tx_txn_dt' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'date - new to old',
      });
    }
  }

  generateTypeFilterPills(filter: Filters, filterPills: FilterPill[]) {
    const combinedValue = filter.type
      .map((type) => {
        if (type === 'RegularExpenses') {
          return 'Regular Expenses';
        } else if (type === 'PerDiem') {
          return 'Per Diem';
        } else if (type === 'Mileage') {
          return 'Mileage';
        } else {
          return type;
        }
      })
      .reduce((type1, type2) => `${type1}, ${type2}`);

    filterPills.push({
      label: 'Expense Type',
      type: 'type',
      value: combinedValue,
    });
  }

  generateDateFilterPills(filter: Filters, filterPills: FilterPill[]) {
    let filterPillsCopy = cloneDeep(filterPills);
    if (filter.date === DateFilters.thisWeek) {
      filterPillsCopy.push({
        label: 'Date',
        type: 'date',
        value: 'this Week',
      });
    }

    if (filter.date === DateFilters.thisMonth) {
      filterPillsCopy.push({
        label: 'Date',
        type: 'date',
        value: 'this Month',
      });
    }

    if (filter.date === DateFilters.all) {
      filterPillsCopy.push({
        label: 'Date',
        type: 'date',
        value: 'All',
      });
    }

    if (filter.date === DateFilters.lastMonth) {
      filterPillsCopy.push({
        label: 'Date',
        type: 'date',
        value: 'Last Month',
      });
    }

    if (filter.date === DateFilters.custom) {
      filterPillsCopy = this.generateCustomDatePill(filter, filterPillsCopy);
    }

    return filterPillsCopy;
  }

  generateCustomDatePill(filter: Filters, filterPills: FilterPill[]) {
    const filterPillsCopy = cloneDeep(filterPills);
    const startDate = filter.customDateStart && moment(filter.customDateStart).format('y-MM-D');
    const endDate = filter.customDateEnd && moment(filter.customDateEnd).format('y-MM-D');

    if (startDate && endDate) {
      filterPillsCopy.push({
        label: 'Date',
        type: 'date',
        value: `${startDate} to ${endDate}`,
      });
    } else if (startDate) {
      filterPillsCopy.push({
        label: 'Date',
        type: 'date',
        value: `>= ${startDate}`,
      });
    } else if (endDate) {
      filterPillsCopy.push({
        label: 'Date',
        type: 'date',
        value: `<= ${endDate}`,
      });
    }

    return filterPillsCopy;
  }

  generateReceiptsAttachedFilterPills(filterPills: FilterPill[], filter) {
    filterPills.push({
      label: 'Receipts Attached',
      type: 'receiptsAttached',
      value: filter.receiptsAttached.toLowerCase(),
    });
  }

  generateCardFilterPills(filterPills: FilterPill[], filter) {
    filterPills.push({
      label: 'Cards',
      type: 'cardNumbers',
      value: filter.cardNumbers
        .map((cardNumber) => this.maskNumber.transform(cardNumber))
        .reduce((state1, state2) => `${state1}, ${state2}`),
    });
  }

  generateStateFilterPills(filterPills: FilterPill[], filter) {
    filterPills.push({
      label: 'Type',
      type: 'state',
      value: filter.state
        .map((state) => {
          if (state === 'DRAFT') {
            return 'Incomplete';
          } else if (state === 'READY_TO_REPORT') {
            return 'Unreported';
          } else {
            return state.replace(/_/g, ' ').toLowerCase();
          }
        })
        .reduce((state1, state2) => `${state1}, ${state2}`),
    });
  }

  convertSelectedSortFitlersToFilters(
    sortBy: SelectedFilters<any>,
    generatedFilters: Partial<{
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      receiptsAttached: string;
      type: string[];
      sortParam: string;
      sortDir: string;
      cardNumbers: string[];
    }>
  ) {
    if (sortBy) {
      if (sortBy.value === 'dateNewToOld') {
        generatedFilters.sortParam = 'tx_txn_dt';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'dateOldToNew') {
        generatedFilters.sortParam = 'tx_txn_dt';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'amountHighToLow') {
        generatedFilters.sortParam = 'tx_amount';
        generatedFilters.sortDir = 'desc';
      } else if (sortBy.value === 'amountLowToHigh') {
        generatedFilters.sortParam = 'tx_amount';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'categoryAToZ') {
        generatedFilters.sortParam = 'tx_org_category';
        generatedFilters.sortDir = 'asc';
      } else if (sortBy.value === 'categoryZToA') {
        generatedFilters.sortParam = 'tx_org_category';
        generatedFilters.sortDir = 'desc';
      }
    }
  }

  getFilters(): FilterOptions<string>[] {
    return [
      {
        name: 'Type',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Unreported',
            value: 'READY_TO_REPORT',
          },
          {
            label: 'Policy Violated',
            value: 'POLICY_VIOLATED',
          },
          {
            label: 'Cannot Report',
            value: 'CANNOT_REPORT',
          },
          {
            label: 'Incomplete',
            value: 'DRAFT',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Date',
        optionType: FilterOptionType.date,
        options: [
          {
            label: 'All',
            value: DateFilters.all,
          },
          {
            label: 'This Week',
            value: DateFilters.thisWeek,
          },
          {
            label: 'This Month',
            value: DateFilters.thisMonth,
          },
          {
            label: 'Last Month',
            value: DateFilters.lastMonth,
          },
          {
            label: 'Custom',
            value: DateFilters.custom,
          },
        ],
      } as FilterOptions<DateFilters>,
      {
        name: 'Receipts Attached',
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: 'Yes',
            value: 'YES',
          },
          {
            label: 'No',
            value: 'NO',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Expense Type',
        optionType: FilterOptionType.multiselect,
        options: [
          {
            label: 'Mileage',
            value: 'Mileage',
          },
          {
            label: 'Per Diem',
            value: 'PerDiem',
          },
          {
            label: 'Regular Expenses',
            value: 'RegularExpenses',
          },
        ],
      } as FilterOptions<string>,
      {
        name: 'Sort By',
        optionType: FilterOptionType.singleselect,
        options: [
          {
            label: 'Date - New to Old',
            value: 'dateNewToOld',
          },
          {
            label: 'Date - Old to New',
            value: 'dateOldToNew',
          },
          {
            label: 'Amount - High to Low',
            value: 'amountHighToLow',
          },
          {
            label: 'Amount - Low to High',
            value: 'amountLowToHigh',
          },
          {
            label: 'Category - A to Z',
            value: 'categoryAToZ',
          },
          {
            label: 'Category - Z to A',
            value: 'categoryZToA',
          },
        ],
      } as FilterOptions<string>,
    ];
  }

  generateSelectedFilters(filter: Filters): SelectedFilters<any>[] {
    const generatedFilters: SelectedFilters<any>[] = [];

    if (filter.state) {
      generatedFilters.push({
        name: 'Type',
        value: filter.state,
      });
    }

    if (filter.receiptsAttached) {
      generatedFilters.push({
        name: 'Receipts Attached',
        value: filter.receiptsAttached,
      });
    }

    if (filter.date) {
      generatedFilters.push({
        name: 'Date',
        value: filter.date,
        associatedData: {
          startDate: filter.customDateStart,
          endDate: filter.customDateEnd,
        },
      });
    }

    if (filter.type) {
      generatedFilters.push({
        name: 'Expense Type',
        value: filter.type,
      });
    }

    if (filter.cardNumbers) {
      generatedFilters.push({
        name: 'Cards',
        value: filter.cardNumbers,
      });
    }

    if (filter.sortParam && filter.sortDir) {
      this.addSortToGeneratedFilters(filter, generatedFilters);
    }

    return generatedFilters;
  }

  addSortToGeneratedFilters(
    filter: Partial<{
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      receiptsAttached: string;
      type: string[];
      sortParam: string;
      sortDir: string;
      cardNumbers: string[];
    }>,
    generatedFilters: SelectedFilters<any>[]
  ) {
    this.convertTxnDtSortToSelectedFilters(filter, generatedFilters);

    this.convertAmountSortToSelectedFilters(filter, generatedFilters);

    this.convertCategorySortToSelectedFilters(filter, generatedFilters);
  }

  convertCategorySortToSelectedFilters(
    filter: Partial<{
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      receiptsAttached: string;
      type: string[];
      sortParam: string;
      sortDir: string;
      cardNumbers: string[];
    }>,
    generatedFilters: SelectedFilters<any>[]
  ) {
    if (filter.sortParam === 'tx_org_category' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'categoryAToZ',
      });
    } else if (filter.sortParam === 'tx_org_category' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'categoryZToA',
      });
    }
  }

  convertAmountSortToSelectedFilters(
    filter: Partial<{
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      receiptsAttached: string;
      type: string[];
      sortParam: string;
      sortDir: string;
      cardNumbers: string[];
    }>,
    generatedFilters: SelectedFilters<any>[]
  ) {
    if (filter.sortParam === 'tx_amount' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'amountHighToLow',
      });
    } else if (filter.sortParam === 'tx_amount' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'amountLowToHigh',
      });
    }
  }

  convertTxnDtSortToSelectedFilters(
    filter: Partial<{
      state: string[];
      date: string;
      customDateStart: Date;
      customDateEnd: Date;
      receiptsAttached: string;
      type: string[];
      sortParam: string;
      sortDir: string;
      cardNumbers: string[];
    }>,
    generatedFilters: SelectedFilters<any>[]
  ) {
    if (filter.sortParam === 'tx_txn_dt' && filter.sortDir === 'asc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'dateOldToNew',
      });
    } else if (filter.sortParam === 'tx_txn_dt' && filter.sortDir === 'desc') {
      generatedFilters.push({
        name: 'Sort By',
        value: 'dateNewToOld',
      });
    }
  }

  private generateSortCategoryPills(filter: Filters, filterPills: FilterPill[]) {
    if (filter.sortParam === 'tx_org_category' && filter.sortDir === 'asc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'category - a to z',
      });
    } else if (filter.sortParam === 'tx_org_category' && filter.sortDir === 'desc') {
      filterPills.push({
        label: 'Sort By',
        type: 'sort',
        value: 'category - z to a',
      });
    }
  }
}
