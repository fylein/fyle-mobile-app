import { FilteredMissingFieldsViolations } from '../models/filtered-missing-fields-violations.model';

export const filteredMissingFieldsViolationsData: FilteredMissingFieldsViolations = {
  isMissingFields: false,
  type: 'category',
  name: 'food',
  currency: 'USD',
  amount: 67.8,
  isExpanded: false,
};

export const filteredMissingFieldsViolationsData2: FilteredMissingFieldsViolations = {
  isMissingFields: true,
  type: 'category',
  name: 'Food',
  currency: 'INR',
  amount: 122,
};
