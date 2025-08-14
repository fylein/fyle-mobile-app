import deepFreeze from 'deep-freeze-strict';

import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';

export const creditTxnFilterPill: FilterPill[] = deepFreeze([
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Credit',
  },
]);

export const debitTxnFilterPill: FilterPill[] = deepFreeze([
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Debit',
  },
]);

export const allFilterPills: FilterPill[] = deepFreeze([
  {
    label: 'Created date',
    type: 'date',
    value: '2023-02-20 to 2023-02-22',
  },
  {
    label: 'Updated date',
    type: 'date',
    value: '2023-02-22 to 2023-02-24',
  },
  {
    label: 'Transactions Type',
    type: 'string',
    value: 'Debit',
  },
]);

export const taskFiltersPills: FilterPill[] = deepFreeze([
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
]);
export const expectedFilterPill1: FilterPill[] = deepFreeze([
  {
    label: 'Type',
    type: 'state',
    value: 'Incomplete, Complete',
  },
  {
    label: 'Receipts attached',
    type: 'receiptsAttached',
    value: 'yes',
  },
  {
    label: 'Potential duplicates',
    type: 'potentialDuplicates',
    value: 'yes',
  },
  {
    label: 'Expense type',
    type: 'type',
    value: 'Per Diem, Mileage',
  },
  {
    label: 'Sort by',
    type: 'sort',
    value: 'category - a to z',
  },
  {
    label: 'Cards ending in...',
    type: 'cardNumbers',
    value: '****1234, ****5678',
  },
  {
    label: 'Split expense',
    type: 'splitExpense',
    value: 'yes',
  },
]);

export const expectedFilterPill2: FilterPill[] = deepFreeze([
  {
    label: 'Receipts attached',
    type: 'receiptsAttached',
    value: 'yes',
  },
  {
    label: 'Sort by',
    type: 'sort',
    value: 'category - a to z',
  },
  {
    label: 'Split expense',
    type: 'splitExpense',
    value: 'yes',
  },
]);

export const stateFilterPill: FilterPill = deepFreeze({
  label: 'Type',
  type: 'state',
  value: 'Incomplete, Complete',
});

export const receiptsAttachedFilterPill: FilterPill = deepFreeze({
  label: 'Receipts attached',
  type: 'receiptsAttached',
  value: 'yes',
});

export const potentialDuplicatesFilterPill: FilterPill = deepFreeze({
  label: 'Potential duplicates',
  type: 'potentialDuplicates',
  value: 'yes',
});

export const dateFilterPill: FilterPill[] = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: 'this Week',
  },
]);

export const typeFilterPill: FilterPill = deepFreeze({
  label: 'Expense type',
  type: 'type',
  value: 'Per Diem, Mileage',
});

export const sortFilterPill: FilterPill = deepFreeze({
  label: 'Sort by',
  type: 'sort',
  value: 'category - a to z',
});

export const cardFilterPill: FilterPill = deepFreeze({
  label: 'Cards ending in...',
  type: 'cardNumbers',
  value: '****1234, ****5678',
});

export const splitExpenseFilterPill: FilterPill = deepFreeze({
  label: 'Split expense',
  type: 'splitExpense',
  value: 'yes',
});

export const filterTypeMappings: FilterPill[] = deepFreeze([
  stateFilterPill,
  receiptsAttachedFilterPill,
  typeFilterPill,
  dateFilterPill[0],
  sortFilterPill,
  splitExpenseFilterPill,
]);

export const sortByDescFilterPill: FilterPill[] = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'amount - high to low',
  },
]);

export const sortByAscFilterPill: FilterPill[] = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'amount - low to high',
  },
]);

export const sortByDateAscFilterPill: FilterPill[] = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'date - old to new',
  },
]);

export const sortByDateDescFilterPill: FilterPill[] = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'date - new to old',
  },
]);

export const expectedDateFilterPill = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: '2023-01-21 to 2023-01-31',
  },
]);

export const stateFilterPill2: FilterPill = deepFreeze({
  label: 'Type',
  type: 'state',
  value: 'Incomplete, Complete, approved',
});
