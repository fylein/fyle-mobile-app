import { TransformedSplitExpenseMissingFields } from '../models/transformed-split-expense-missing-fields.model';

export const transformedSplitExpenseMissingFieldsData: Partial<TransformedSplitExpenseMissingFields> = {
  amount: 67,
  currency: 'USD',
  name: 'food',
  type: 'category',
};

export const transformedSplitExpenseMissingFieldsData2: Partial<TransformedSplitExpenseMissingFields> = {
  amount: 122,
  currency: 'INR',
  name: 'Food',
  type: 'category',
  data: { missing_amount: false, missing_receipt: false, missing_currency: false, missing_expense_field_ids: [] },
};
