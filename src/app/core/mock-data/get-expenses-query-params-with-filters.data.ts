import { GetExpenseQueryParam } from '../models/platform/v1/get-expenses-query.model';

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
