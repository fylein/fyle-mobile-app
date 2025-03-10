import deepFreeze from 'deep-freeze-strict';

import { TransformedSplitExpenseMissingFields } from '../models/transformed-split-expense-missing-fields.model';

export const transformedSplitExpenseMissingFieldsData: Partial<TransformedSplitExpenseMissingFields> = deepFreeze({
  amount: 67,
  currency: 'USD',
  name: 'food',
  type: 'category',
});

export const transformedSplitExpenseMissingFieldsData2: Partial<TransformedSplitExpenseMissingFields> = deepFreeze({
  amount: 122,
  currency: 'INR',
  name: 'Food',
  type: 'category',
  inputFieldInfo: { Category: 'Travel', 'Cost Center': 'Finance', Project: 'Project A' },
  data: { missing_amount: false, missing_receipt: false, missing_currency: false, missing_expense_field_ids: [] },
});

export const transformedSplitExpenseMissingFieldsData3: Partial<TransformedSplitExpenseMissingFields> = deepFreeze({
  amount: 122,
  currency: 'INR',
  inputFieldInfo: { Category: 'Travel', 'Cost Center': 'Finance', Project: 'Project A' },
  data: { missing_amount: false, missing_receipt: false, missing_currency: false, missing_expense_field_ids: [] },
});

export const transformedSplitExpenseMissingFieldsData4: Partial<TransformedSplitExpenseMissingFields> = deepFreeze({
  amount: 122,
  currency: 'INR',
  inputFieldInfo: { Category: 'Travel', 'Cost Center': 'Finance', Project: 'Project A' },
  data: {
    missing_amount: false,
    missing_receipt: false,
    missing_currency: false,
    missing_expense_field_ids: ['4039724', '4534454'],
  },
});
