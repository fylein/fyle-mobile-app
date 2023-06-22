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

export const expectedFilterPill1: FilterPill[] = [
  {
    label: 'Type',
    type: 'state',
    value: 'Incomplete, Complete',
  },
  {
    label: 'Receipts Attached',
    type: 'receiptsAttached',
    value: 'yes',
  },
  {
    label: 'Expense Type',
    type: 'type',
    value: 'Per Diem, Mileage',
  },
  {
    label: 'Sort By',
    type: 'sort',
    value: 'category - a to z',
  },
  {
    label: 'Cards',
    type: 'cardNumbers',
    value: '****1234, ****5678',
  },
  {
    label: 'Split Expense',
    type: 'splitExpense',
    value: 'yes',
  },
];

export const expectedFilterPill2: FilterPill[] = [
  {
    label: 'Receipts Attached',
    type: 'receiptsAttached',
    value: 'yes',
  },
  {
    label: 'Sort By',
    type: 'sort',
    value: 'category - a to z',
  },
  {
    label: 'Split Expense',
    type: 'splitExpense',
    value: 'yes',
  },
];

export const expectedFilterPill3 = [
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Credit',
  },
];
