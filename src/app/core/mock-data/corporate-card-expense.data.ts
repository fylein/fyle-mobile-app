import { ApiV2Response } from '../models/v2/api-v2-response.model';
import { CorporateCardExpense } from '../models/v2/corporate-card-expense.model';

export const corporateCardExpenseData: ApiV2Response<CorporateCardExpense> = {
  count: 0,
  data: [],
  limit: 0,
  offset: 0,
  url: '/v2/corporate_card_transactions',
};
