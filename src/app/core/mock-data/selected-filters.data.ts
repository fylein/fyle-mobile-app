import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';

export const selectedFilters1: SelectedFilters<string>[] = [
  {
    name: 'Created On',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-02-20T00:00:00.000Z'),
      endDate: new Date('2023-02-22T00:00:00.000Z'),
    },
  },
  {
    name: 'Updated On',
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
];

export const selectedFilters2: SelectedFilters<string>[] = [
  {
    name: 'Updated On',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-02-22T00:00:00.000Z'),
      endDate: new Date('2023-02-24T00:00:00.000Z'),
    },
  },
  {
    name: 'Created On',
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
];

export const selectedFilters3 = [
  { name: 'State', value: 'Approved' },
  {
    name: 'Date',
    value: 'Last 7 Days',
    associatedData: { startDate: new Date('2023-04-01'), endDate: new Date('2023-04-04') },
  },
  { name: 'Sort By', value: 'dateNewToOld' },
];

export const selectedFilters4 = [
  { name: 'State', value: 'Approved' },
  { name: 'Date', value: 'Last 7 Days', associatedData: undefined },
  { name: 'Sort By', value: 'dateNewToOld' },
];

export const selectedFilters5 = [
  {
    name: 'Date',
    value: 'Last Month',
    associatedData: { startDate: new Date('2023-01-04'), endDate: new Date('2023-01-10') },
  },
];

export const taskSelectedFiltersData: SelectedFilters<string[]>[] = [
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
];

export const selectedFilters6: SelectedFilters<string | string[]>[] = [
  {
    name: 'State',
    value: 'DRAFT',
  },
  {
    name: 'Submitted Date',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-02-02'),
    },
  },
];

export const selectedFiltersParams: SelectedFilters<string> = {
  name: 'Sort By',
  value: 'dateNewToOld',
};

export const selectedFiltersParams2: SelectedFilters<string>[] = [
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
    name: 'Submitted Date',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-02-02'),
    },
  },
];
