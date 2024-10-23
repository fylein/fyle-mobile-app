import deepFreezeStrict from 'deep-freeze-strict';
import { SplitExpenseMissingFields } from '../models/platform/v1/split-expense-missing-fields.model';

export const SplitExpenseMissingFieldsData: SplitExpenseMissingFields = deepFreezeStrict({
  data: [
    {
      missing_amount: false,
      missing_receipt: false,
      missing_currency: false,
      missing_expense_field_ids: [],
    },
  ],
});
