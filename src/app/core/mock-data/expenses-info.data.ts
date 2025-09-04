import deepFreeze from 'deep-freeze-strict';

import { ExpensesInfo } from '../models/expenses-info.model';

export const expenseInfoWithoutDefaultExpense: ExpensesInfo = deepFreeze({
  isReportedAndAbove: false,
  isAdvancePresent: false,
  defaultExpenses: null,
});
