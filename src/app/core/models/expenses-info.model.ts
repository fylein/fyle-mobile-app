import { Expense } from './expense.model';

export interface ExpensesInfo {
  isReportedAndAbove: boolean;
  isAdvancePresent: boolean;
  defaultExpenses: Partial<Expense>[];
}
