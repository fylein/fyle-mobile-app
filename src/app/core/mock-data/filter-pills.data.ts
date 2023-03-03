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
