import { Expense } from '../models/expense.model';

export interface ExpensesInfo {
  isReportedAndAbove: boolean;
  isAdvancePresent: boolean;
  defaultExpenses: Partial<Expense>[];
}
