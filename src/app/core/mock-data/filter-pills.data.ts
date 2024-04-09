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

export const stateFilterPill: FilterPill = {
  label: 'Type',
  type: 'state',
  value: 'Incomplete, Complete',
};

export const receiptsAttachedFilterPill: FilterPill = {
  label: 'Receipts Attached',
  type: 'receiptsAttached',
  value: 'yes',
};

export const dateFilterPill: FilterPill[] = [
  {
    label: 'Date',
    type: 'date',
    value: 'this Week',
  },
];

export const typeFilterPill: FilterPill = {
  label: 'Expense Type',
  type: 'type',
  value: 'Per Diem, Mileage',
};

export const sortFilterPill: FilterPill = {
  label: 'Sort By',
  type: 'sort',
  value: 'category - a to z',
};

export const cardFilterPill: FilterPill = {
  label: 'Cards',
  type: 'cardNumbers',
  value: '****1234, ****5678',
};

export const splitExpenseFilterPill: FilterPill = {
  label: 'Split Expense',
  type: 'splitExpense',
  value: 'yes',
};

export const filterTypeMappings: FilterPill[] = [
  stateFilterPill,
  receiptsAttachedFilterPill,
  typeFilterPill,
  dateFilterPill[0],
  sortFilterPill,
  splitExpenseFilterPill,
];

export const sortByDescFilterPill: FilterPill[] = [
  {
    label: 'Sort By',
    type: 'sort',
    value: 'amount - high to low',
  },
];

export const sortByAscFilterPill: FilterPill[] = [
  {
    label: 'Sort By',
    type: 'sort',
    value: 'amount - low to high',
  },
];

export const sortByDateAscFilterPill: FilterPill[] = [
  {
    label: 'Sort By',
    type: 'sort',
    value: 'date - old to new',
  },
];

export const sortByDateDescFilterPill: FilterPill[] = [
  {
    label: 'Sort By',
    type: 'sort',
    value: 'date - new to old',
  },
];

export const expectedDateFilterPill = [
  {
    label: 'Date',
    type: 'date',
    value: '2023-01-21 to 2023-01-31',
  },
];

export const stateFilterPill2: FilterPill = {
  label: 'Type',
  type: 'state',
  value: 'Incomplete, Complete, approved',
};
