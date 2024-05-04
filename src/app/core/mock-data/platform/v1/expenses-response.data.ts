import deepFreeze from 'deep-freeze-strict';

import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { expenseData } from './expense.data';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

export const expensesResponse: PlatformApiResponse<Expense> = deepFreeze({
  count: 1,
  data: [expenseData],
  offset: 0,
});
