import { GetExpensesQueryParamsWithFilters } from '../models/get-expenses-query-params-with-filters.model';

export const expectedCurrentParams: Partial<GetExpensesQueryParamsWithFilters> = {
  sortDir: 'asc',
  queryParams: {
    corporate_credit_card_account_number: 'in.(789)',
    and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
    or: ['(tx_is_split_expense.eq.true)'],
  },
};
