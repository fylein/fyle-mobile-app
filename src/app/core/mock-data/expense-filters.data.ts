import { ExpenseFilters } from 'src/app/fyle/my-expenses/expense-filters.model';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { ExpenseType } from '../enums/expense-type.enum';
import { FilterState } from '../enums/filter-state.enum';

export const expenseFiltersData1: Partial<ExpenseFilters> = {
  state: ['DRAFT', 'READY_TO_REPORT'],
  date: DateFilters.thisWeek,
  receiptsAttached: 'YES',
  type: ['PerDiem', 'Mileage'],
  sortParam: 'category->name',
  sortDir: 'asc',
  cardNumbers: ['1234', '5678'],
  splitExpense: 'YES',
};

export const expenseFiltersDataWoCards: Partial<ExpenseFilters> = {
  state: ['DRAFT', 'READY_TO_REPORT'],
  date: DateFilters.thisWeek,
  receiptsAttached: 'YES',
  type: ['PerDiem', 'Mileage'],
  sortParam: 'category->name',
  sortDir: 'asc',
  splitExpense: 'YES',
};

export const expenseFiltersData1Old: Partial<ExpenseFilters> = {
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
  sortParam: 'category->name',
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
  sortParam: 'amount',
  sortDir: 'desc',
  splitExpense: 'YES',
};

export const expenseFiltersData5Old: Partial<ExpenseFilters> = {
  receiptsAttached: 'YES',
  sortParam: 'tx_amount',
  sortDir: 'desc',
  splitExpense: 'YES',
};

export const expenseFiltersData6: Partial<ExpenseFilters> = {
  receiptsAttached: 'YES',
  sortParam: 'spent_at',
  sortDir: 'asc',
  splitExpense: 'YES',
};

export const expenseFiltersData7: Partial<ExpenseFilters> = {
  receiptsAttached: 'YES',
  sortParam: 'tx_txn_dt',
  sortDir: 'asc',
  splitExpense: 'YES',
};

export const expenseFiltersDataWCustom: Partial<ExpenseFilters> = {
  state: 'custom',
  date: DateFilters.custom,
  customDateStart: new Date('2023-01-04'),
  customDateEnd: new Date('2023-01-10'),
  receiptsAttached: 'Yes',
  type: [ExpenseType.MILEAGE, ExpenseType.PER_DIEM, 'RegularExpenses'],
  cardNumbers: ['1234', '2389'],
  splitExpense: 'Yes',
};

export const expenseFiltersDataWithCustomStart: Partial<ExpenseFilters> = {
  state: 'custom',
  date: DateFilters.custom,
  customDateStart: new Date('2023-01-04'),
  receiptsAttached: 'Yes',
  type: ['Mileage'],
  cardNumbers: ['1234', '2389'],
  splitExpense: 'Yes',
};

export const expenseFiltersDataWithCustomEnd: Partial<ExpenseFilters> = {
  state: 'custom',
  date: DateFilters.custom,
  customDateEnd: new Date('2023-01-10'),
  receiptsAttached: 'Yes',
  type: ['Mileage'],
  cardNumbers: ['1234', '2389'],
  splitExpense: 'Yes',
};

export const expenseFiltersDataWoReceipts: Partial<ExpenseFilters> = {
  state: 'custom',
  date: DateFilters.custom,
  customDateEnd: new Date('2023-01-10'),
  receiptsAttached: 'NO',
  type: ['Mileage'],
  cardNumbers: ['1234', '2389'],
  splitExpense: 'Yes',
};

export const expenseFiltersDataWoSplit: Partial<ExpenseFilters> = {
  state: 'custom',
  date: DateFilters.custom,
  customDateEnd: new Date('2023-01-10'),
  receiptsAttached: 'NO',
  type: ['Mileage'],
  cardNumbers: ['1234', '2389'],
  splitExpense: 'NO',
};

export const expenseFiltersDataAllStates: Partial<ExpenseFilters> = {
  state: [FilterState.DRAFT, FilterState.CANNOT_REPORT, FilterState.POLICY_VIOLATED, FilterState.READY_TO_REPORT],
  date: DateFilters.thisWeek,
  customDateStart: new Date('2023-01-04'),
  customDateEnd: new Date('2023-01-10'),
  receiptsAttached: 'YES',
  type: ['PerDiem', 'Mileage'],
  sortParam: 'category->name',
  sortDir: 'asc',
  cardNumbers: ['1234', '5678'],
  splitExpense: 'YES',
};

export const expenseFiltersDataMonth: Partial<ExpenseFilters> = {
  state: [FilterState.DRAFT, FilterState.CANNOT_REPORT, FilterState.POLICY_VIOLATED, FilterState.READY_TO_REPORT],
  date: DateFilters.thisMonth,
  customDateStart: new Date('2023-01-04'),
  customDateEnd: new Date('2023-01-10'),
  receiptsAttached: 'YES',
  type: ['PerDiem', 'Mileage'],
  sortParam: 'category->name',
  sortDir: 'asc',
  cardNumbers: ['1234', '5678'],
  splitExpense: 'YES',
};

export const expenseFiltersDataLastMonth: Partial<ExpenseFilters> = {
  state: [FilterState.DRAFT],
  date: DateFilters.lastMonth,
  customDateStart: new Date('2023-01-04'),
  customDateEnd: new Date('2023-01-10'),
  receiptsAttached: 'YES',
  type: ['PerDiem', 'Mileage'],
  sortParam: 'category->name',
  sortDir: 'asc',
  cardNumbers: ['1234', '5678'],
  splitExpense: 'YES',
};
