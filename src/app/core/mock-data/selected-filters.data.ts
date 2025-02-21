import deepFreeze from 'deep-freeze-strict';

import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';

export const selectedFilters1: SelectedFilters<string>[] = deepFreeze([
  {
    name: 'Created date',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-02-20T00:00:00.000Z'),
      endDate: new Date('2023-02-22T00:00:00.000Z'),
    },
  },
  {
    name: 'Updated date',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-02-22T00:00:00.000Z'),
      endDate: new Date('2023-02-24T00:00:00.000Z'),
    },
  },
  {
    name: 'Transactions Type',
    value: 'Debit',
  },
  {
    name: 'Type',
    value: 'custom',
  },
  {
    name: 'Receipts Attached',
    value: 'custom',
  },
]);

export const selectedFilters2: SelectedFilters<string>[] = deepFreeze([
  {
    name: 'Updated date',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-02-22T00:00:00.000Z'),
      endDate: new Date('2023-02-24T00:00:00.000Z'),
    },
  },
  {
    name: 'Created date',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-02-20T00:00:00.000Z'),
      endDate: new Date('2023-02-22T00:00:00.000Z'),
    },
  },
  {
    name: 'Transactions Type',
    value: 'Debit',
  },
]);

export const selectedFilters3 = deepFreeze([
  { name: 'State', value: 'Approved' },
  {
    name: 'Date',
    value: 'Last 7 Days',
    associatedData: { startDate: new Date('2023-04-01'), endDate: new Date('2023-04-04') },
  },
  { name: 'Sort by', value: 'dateNewToOld' },
]);

export const selectedFilters4 = deepFreeze([
  { name: 'State', value: 'Approved' },
  { name: 'Date', value: 'Last 7 Days', associatedData: undefined },
  { name: 'Sort by', value: 'dateNewToOld' },
]);

export const selectedFilters5 = deepFreeze([
  {
    name: 'Date',
    value: 'Last Month',
    associatedData: { startDate: new Date('2023-01-04'), endDate: new Date('2023-01-10') },
  },
]);

export const taskSelectedFiltersData: SelectedFilters<string[]>[] = deepFreeze([
  {
    name: 'Expenses',
    value: ['DRAFT'],
  },
  {
    name: 'Reports',
    value: ['DRAFT'],
  },
  {
    name: 'Advances',
    value: ['SENT_BACK'],
  },
]);

export const selectedFilters6: SelectedFilters<string | string[]>[] = deepFreeze([
  {
    name: 'State',
    value: 'DRAFT',
  },
  {
    name: 'Submitted date',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-02-02'),
    },
  },
]);

export const selectedFiltersParams: SelectedFilters<string> = deepFreeze({
  name: 'Sort by',
  value: 'dateNewToOld',
});

export const selectedFiltersParams2: SelectedFilters<string>[] = deepFreeze([
  {
    name: 'State',
    value: 'DRAFT',
  },
  {
    name: 'Date',
    value: 'Last Month',
    associatedData: { startDate: new Date('2023-01-04'), endDate: new Date('2023-01-10') },
  },
  {
    name: 'Submitted date',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-02-02'),
    },
  },
]);

export const selectedFilters7: SelectedFilters<string | string[]>[] = deepFreeze([
  ...selectedFilters5,
  {
    name: 'Type',
    value: 'custom',
  },
  {
    name: 'Receipts Attached',
    value: 'Yes',
  },
  {
    name: 'Expense Type',
    value: ['Mileage'],
  },
  {
    name: 'Cards ending in...',
    value: ['1234', '2389'],
  },
  { name: 'Sort by', value: 'dateNewToOld' },
  {
    name: 'Split Expense',
    value: 'Yes',
  },
]);

export const selectedFilters8: SelectedFilters<string | string[]>[] = deepFreeze([
  {
    name: 'Date',
    value: 'Last Month',
  },
  {
    name: 'Type',
    value: 'custom',
  },
  {
    name: 'Receipts Attached',
    value: 'Yes',
  },
  {
    name: 'Expense Type',
    value: ['Mileage'],
  },
  {
    name: 'Cards ending in...',
    value: ['1234', '2389'],
  },
  { name: 'Sort by', value: 'dateNewToOld' },
  {
    name: 'Split Expense',
    value: 'Yes',
  },
]);

export const selectedFilters9: SelectedFilters<string | string[]>[] = deepFreeze([
  {
    name: 'Type',
    value: ['DRAFT', 'READY_TO_REPORT'],
  },
  {
    name: 'Receipts Attached',
    value: 'YES',
  },
  {
    name: 'Potential duplicates',
    value: 'YES',
  },
  {
    name: 'Date',
    value: 'thisWeek',
    associatedData: {
      startDate: undefined,
      endDate: undefined,
    },
  },
  {
    name: 'Expense Type',
    value: ['PerDiem', 'Mileage'],
  },
  {
    name: 'Cards ending in...',
    value: ['1234', '5678'],
  },
  {
    name: 'Split Expense',
    value: 'YES',
  },
]);
