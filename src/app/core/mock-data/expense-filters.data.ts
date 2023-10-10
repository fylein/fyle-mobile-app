import { ExpenseFilters } from 'src/app/fyle/my-expenses/expense-filters.model';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';

export const expenseFiltersData1: Partial<ExpenseFilters> = {
  state: ['DRAFT', 'READY_TO_REPORT'],
  date: DateFilters.thisWeek,
  receiptsAttached: 'YES',
  type: ['PerDiem', 'Mileage'],
  sortParam: 'tx_org_category',
  sortDir: 'asc',
  cardNumbers: ['1234', '5678'],
  splitExpense: 'YES',
};

export const expenseFiltersData2: Partial<ExpenseFilters> = {
  date: DateFilters.thisWeek,
  receiptsAttached: 'YES',
  sortParam: 'tx_org_category',
  sortDir: 'asc',
  splitExpense: 'YES',
};

export const expenseFiltersData3: Partial<ExpenseFilters> = {
  state: 'custom',
  date: 'Last Month',
  customDateStart: new Date('2023-01-04'),
  customDateEnd: new Date('2023-01-10'),
  receiptsAttached: 'Yes',
  type: ['Mileage'],
  cardNumbers: ['1234', '2389'],
  splitExpense: 'Yes',
};

export const expenseFiltersData4: Partial<ExpenseFilters> = {
  ...expenseFiltersData3,
  customDateStart: undefined,
  customDateEnd: undefined,
};

export const expenseFiltersData5: Partial<ExpenseFilters> = {
  receiptsAttached: 'YES',
  sortParam: 'tx_amount',
  sortDir: 'desc',
  splitExpense: 'YES',
};

export const expenseFiltersData6: Partial<ExpenseFilters> = {
  receiptsAttached: 'YES',
  sortParam: 'tx_txn_dt',
  sortDir: 'asc',
  splitExpense: 'YES',
};
