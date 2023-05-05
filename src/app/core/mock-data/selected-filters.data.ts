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
