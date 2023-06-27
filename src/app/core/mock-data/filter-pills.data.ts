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
    value: '2023-02-20 to 2023-02-22',
  },
  {
    label: 'Updated On',
    type: 'date',
    value: '2023-02-22 to 2023-02-24',
  },
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Debit',
  },
];

export const taskFiltersPills: FilterPill[] = [
  {
    label: 'Expenses',
    type: 'Expenses',
    value: 'Complete',
  },
  {
    label: 'Reports',
    type: 'Reports',
    value: 'Sent Back',
  },
  {
    label: 'Advances',
    type: 'Advances',
    value: 'Sent Back',
  },
];
