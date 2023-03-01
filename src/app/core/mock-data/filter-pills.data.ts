import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';

export const creditTxnFilterPill: FilterPill[] = [
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Credit',
  },
];

export const debitTxnFilterPill: FilterPill[] = [
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Debit',
  },
];

export const allFilterPills: FilterPill[] = [
  {
    label: 'Created On',
    type: 'date',
    value: '2023-02-21 to 2023-02-23',
  },
  {
    label: 'Updated On',
    type: 'date',
    value: '2023-02-23 to 2023-02-25',
  },
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Debit',
  },
];
