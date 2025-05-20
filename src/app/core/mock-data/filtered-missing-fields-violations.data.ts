import deepFreeze from 'deep-freeze-strict';

import { FilteredMissingFieldsViolations } from '../models/filtered-missing-fields-violations.model';

export const filteredMissingFieldsViolationsData: FilteredMissingFieldsViolations = deepFreeze({
  isMissingFields: false,
  type: 'category',
  name: 'food',
  currency: 'USD',
  amount: 67.8,
  isExpanded: false,
});

export const filteredMissingFieldsViolationsData2: FilteredMissingFieldsViolations = deepFreeze({
  isMissingFields: true,
  type: 'category',
  name: 'Food',
  currency: 'INR',
  inputFieldInfo: { Category: 'Travel', 'Cost Center': 'Finance', Project: 'Project A' },
  amount: 122,
});
