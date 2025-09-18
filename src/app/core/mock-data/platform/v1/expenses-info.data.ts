import { ExpensesInfo } from 'src/app/core/models/expenses-info.model';
import { advanceExpenses, apiExpenses3, reportedAndAboveExpenses } from './expense.data';
import deepFreeze from 'deep-freeze-strict';

export const expensesInfo: ExpensesInfo = deepFreeze({
  isReportedAndAbove: false,
  isAdvancePresent: true,
  defaultExpenses: [apiExpenses3[0]],
});

export const expensesInfoWithAdvanceExpenses: ExpensesInfo = deepFreeze({
  isReportedAndAbove: false,
  isAdvancePresent: true,
  defaultExpenses: [advanceExpenses[0]],
});

export const expensesInfoWithMultipleAdvanceExpenses: ExpensesInfo = deepFreeze({
  isReportedAndAbove: false,
  isAdvancePresent: true,
  defaultExpenses: [advanceExpenses[0], advanceExpenses[1]],
});

export const expensesInfoWithoutDefaultExpense: ExpensesInfo = deepFreeze({
  isReportedAndAbove: false,
  isAdvancePresent: false,
  defaultExpenses: null,
});

export const expensesInfoWithReportedAndAboveExpenses: ExpensesInfo = deepFreeze({
  isReportedAndAbove: true,
  isAdvancePresent: false,
  defaultExpenses: reportedAndAboveExpenses,
});

export const expensesInfoWithOneReportedAndAboveExpense: ExpensesInfo = deepFreeze({
  isReportedAndAbove: true,
  isAdvancePresent: false,
  defaultExpenses: [reportedAndAboveExpenses[0]],
});
