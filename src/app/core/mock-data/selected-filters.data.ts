import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';

export const selectedFilters1: SelectedFilters<string>[] = [
  {
    name: 'Created On',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-02-20T18:30:00.000Z'),
      endDate: new Date('2023-02-22T18:30:00.000Z'),
    },
  },
  {
    name: 'Updated On',
    value: 'custom',
    associatedData: {
      startDate: new Date('2023-02-22T18:30:00.000Z'),
      endDate: new Date('2023-02-24T18:30:00.000Z'),
    },
  },
  {
    name: 'Transactions Type',
    value: 'Debit',
  },
];
