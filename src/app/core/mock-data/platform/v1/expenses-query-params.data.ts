import deepFreeze from 'deep-freeze-strict';

import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';

export const getExpensesQueryParams: ExpensesQueryParams = deepFreeze({
  report_id: 'eq.txOJVaaPxo9O',
});

export const allExpensesQueryParams: ExpensesQueryParams = deepFreeze({
  queryParams: {
    employee_id: 'eq.out3t2X258rd',
    state: ['in.(COMPLETE)'],
    or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
    report_id: ['is.null'],
  },
});

export const unreportedExpensesQueryParams: ExpensesQueryParams = deepFreeze({
  queryParams: {
    state: 'in.(COMPLETE)',
    or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
    report_id: 'is.null',
  },
});
