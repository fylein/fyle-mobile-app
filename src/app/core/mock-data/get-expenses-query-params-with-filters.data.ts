import { GetExpensesQueryParamsWithFilters } from '../models/get-expenses-query-params-with-filters.model';
import { GetExpenseQueryParam } from '../models/platform/v1/get-expenses-query.model';

export const expectedCurrentParams: Partial<GetExpensesQueryParamsWithFilters> = {
  sortDir: 'asc',
  queryParams: {
    corporate_credit_card_account_number: 'in.(789)',
    and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
    or: ['(tx_is_split_expense.eq.true)'],
  },
};

export const expectedCurrentParamsWoFilterState: Partial<GetExpenseQueryParam> = {
  sortDir: 'asc',
  queryParams: {
    or: ['(is_split.eq.true)'],
    'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
    and: '(spent_at.gte.March,spent_at.lt.April)',
  },
};

export const expectedCurrentParamsDraftState: Partial<GetExpenseQueryParam> = {
  sortDir: 'asc',
  queryParams: {
    or: ['(is_split.eq.true)'],
    'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
    and: '(spent_at.gte.March,spent_at.lt.April)',
  },
};

export const expectedCurrentParamsCannotReportState: Partial<GetExpenseQueryParam> = {
  sortDir: 'asc',
  queryParams: {
    or: ['(is_split.eq.true)'],
    'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
    and: '(spent_at.gte.March,spent_at.lt.April)',
  },
};

export const expectedCurrentParamsWithDraftCannotReportState: Partial<GetExpenseQueryParam> = {
  sortDir: 'asc',
  queryParams: {
    or: ['(is_split.eq.true)'],
    'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
    and: '(spent_at.gte.March,spent_at.lt.April)',
  },
};
