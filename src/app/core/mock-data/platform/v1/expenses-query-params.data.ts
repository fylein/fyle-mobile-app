import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';

export const getExpensesQueryParams: ExpensesQueryParams = {
  report_id: 'eq.txOJVaaPxo9O',
};

export const allExpensesQueryParams: ExpensesQueryParams = {
  queryParams: {
    employee_id: 'eq.out3t2X258rd',
    state: ['in.(COMPLETE)'],
    or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
    report_id: ['is.null'],
  },
};

export const unreportedExpensesQueryParams: ExpensesQueryParams = {
  queryParams: {
    state: 'in.(COMPLETE)',
    or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
    report_id: 'is.null',
    and: '(or(matched_corporate_card_transactions.eq.[],matched_corporate_card_transactions->0->status.neq.PENDING))',
  },
};
