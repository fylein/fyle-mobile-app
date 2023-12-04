import { Expense } from '../models/platform/v1/expense.model';

export interface ExpensesInfo {
  isReportedAndAbove: boolean;
  isAdvancePresent: boolean;
  defaultExpenses: Expense[];
}
