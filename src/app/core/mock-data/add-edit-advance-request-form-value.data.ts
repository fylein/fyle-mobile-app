import { AddEditAdvanceRequestFormValue } from '../models/add-edit-advance-request-form-value.model';
import { recentlyUsedProjectRes } from './recently-used.data';

export const addEditAdvanceRequestFormValueData: AddEditAdvanceRequestFormValue = {
  currencyObj: {
    amount: 130,
    currency: 'USD',
    orig_amount: 10,
    orig_currency: 'USD',
  },
  purpose: 'Test purpose',
  notes: 'Test notes',
  project: null,
  customFieldValues: null,
};

export const addEditAdvanceRequestFormValueData2: AddEditAdvanceRequestFormValue = {
  currencyObj: null,
  purpose: null,
  notes: null,
  project: null,
  customFieldValues: [],
};

export const addEditAdvanceRequestFormValueData3: AddEditAdvanceRequestFormValue = {
  ...addEditAdvanceRequestFormValueData,
  project: recentlyUsedProjectRes[0],
};
