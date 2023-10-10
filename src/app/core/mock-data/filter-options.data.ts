import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { AdvancesStates } from '../models/advances-states.model';
import { SortingValue } from '../models/sorting-value.model';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';

export const filterOptions: FilterOptions<string>[] = [
  {
    name: 'State',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Draft',
        value: AdvancesStates.draft,
      },

      {
        label: 'Sent Back',
        value: AdvancesStates.sentBack,
      },
    ],
  },
  {
    name: 'Sort By',
    optionType: FilterOptionType.singleselect,
    options: [
      {
        label: 'Created At - New to Old',
        value: SortingValue.creationDateAsc,
      },
      {
        label: 'Created At - Old to New',
        value: SortingValue.creationDateDesc,
      },
      {
        label: 'Approved At - New to Old',
        value: SortingValue.approvalDateAsc,
      },
      {
        label: 'Approved At - Old to New',
        value: SortingValue.approvalDateDesc,
      },
      {
        label: `Project - A to Z`,
        value: SortingValue.projectAsc,
      },
      {
        label: `Project - Z to A`,
        value: SortingValue.projectDesc,
      },
    ],
  },
];

export const filterOptions2: FilterOptions<string>[] = [
  {
    name: 'Type',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Complete',
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
  },
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
  },
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
  },
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
  },
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
  },
  {
    name: 'Split Expense',
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
  },
];
