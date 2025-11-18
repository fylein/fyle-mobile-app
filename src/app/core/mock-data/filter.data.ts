import deepFreeze from 'deep-freeze-strict';

import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { PersonalCardFilter } from '../models/personal-card-filters.model';

export const filterData1: Partial<PersonalCardFilter> = deepFreeze({
  createdOn: {
    name: 'custom',
    customDateStart: new Date('2023-02-20T00:00:00.000Z'),
    customDateEnd: new Date('2023-02-22T00:00:00.000Z'),
  },
  updatedOn: {
    name: 'custom',
    customDateStart: new Date('2023-02-22T00:00:00.000Z'),
    customDateEnd: new Date('2023-02-24T00:00:00.000Z'),
  },
  transactionType: 'Debit',
});

export const filterOptions1 = deepFreeze([
  {
    name: 'Type',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Complete',
        value: 'COMPLETE',
      },
      {
        label: 'Policy violated',
        value: 'POLICY_VIOLATED',
      },
      {
        label: 'Incomplete',
        value: 'INCOMPLETE',
      },
    ],
  } as FilterOptions<string>,
  {
    name: 'Receipts attached',
    optionType: FilterOptionType.singleselect,
    options: [
      {
        label: 'Yes',
        value: 'yes',
      },
      {
        label: 'No',
        value: 'no',
      },
    ],
  } as FilterOptions<string>,
  {
    name: 'Expense type',
    optionType: FilterOptionType.multiselect,
    options: [
      {
        label: 'Mileage',
        value: 'MILEAGE',
      },
      {
        label: 'Per Diem',
        value: 'PER_DIEM',
      },
      {
        label: 'Regular Expenses',
        value: 'REGULAR_EXPENSES',
      },
    ],
  } as FilterOptions<string>,
  {
    name: 'Created date',
    optionType: FilterOptionType.date,
    options: [
      {
        label: 'All',
        value: 'ALL',
      },
      {
        label: 'This Week',
        value: 'THIS_WEEK',
      },
      {
        label: 'This Month',
        value: 'THIS_MONTH',
      },
    ],
  } as FilterOptions<string>,
]);
