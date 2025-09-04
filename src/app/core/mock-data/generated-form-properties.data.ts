import deepFreeze from 'deep-freeze-strict';

import { GeneratedFormProperties } from '../models/generated-form-properties.model';
import { dependentCustomProperties } from './custom-property.data';
import { optionsData15, optionsData33 } from './merge-expenses-options-data.data';
import { apiExpenses3 } from './platform/v1/expense.data';

export const generatedFormPropertiesData1: GeneratedFormProperties = deepFreeze({
  source_account_id: '1234',
  is_billable: true,
  amount: 100,
  project_id: 3943,
  cost_center_id: 91842,
  tax_amount: 100,
  tax_group_id: '793812',
  category_id: 85913,
  merchant: 'Food',
  vendor: 'Nilesh As Vendor',
  purpose: 'Others',
  spent_at: new Date('2023-02-03'),
  file_ids: ['tx3nHShG60zq'],
  custom_fields: [
    {
      name: 'Custom Property 1',
      value: 'Custom Property 1 Value',
    },
    {
      name: 'Custom Property 2',
      value: 'Custom Property 2 Value',
    },
  ],
  ccce_group_id: '63291',
  started_at: new Date('2023-01-01'),
  ended_at: new Date('2023-02-02'),
  travel_classes: ['Economy'],
  distance: 100,
  distance_unit: 'KM',
  locations: [optionsData15.value, optionsData33.value],
});

export const generatedFormPropertiesData2: GeneratedFormProperties = deepFreeze({
  source_account_id: 'acc7F6bwRa52p',
  is_billable: undefined,
  amount: apiExpenses3[1].amount,
  project_id: 13795,
  cost_center_id: 13796,
  tax_amount: undefined,
  tax_group_id: undefined,
  category_id: undefined,
  merchant: undefined,
  purpose: undefined,
  spent_at: undefined,
  file_ids: [],
  custom_fields: [
    {
      name: 'CUSTOM FIELD',
      value: '',
    },
    {
      name: 'Cost Code',
      value: 'Cost Code 1',
    },
    ...dependentCustomProperties,
  ],
  started_at: undefined,
  ended_at: undefined,
  travel_classes: [],
  distance: undefined,
  distance_unit: undefined,
  locations: [optionsData15.options[0].value, optionsData33.options[0].value],
});

export const generatedFormPropertiesData3: GeneratedFormProperties = deepFreeze({
  source_account_id: apiExpenses3[1].source_account_id,
  is_billable: undefined,
  amount: apiExpenses3[1].amount,
  project_id: undefined,
  cost_center_id: undefined,
  tax_amount: undefined,
  tax_group_id: undefined,
  category_id: undefined,
  merchant: undefined,
  purpose: undefined,
  spent_at: undefined,
  file_ids: [],
  custom_fields: [
    {
      name: 'CUSTOM FIELD',
      value: '',
    },
    {
      name: 'Cost Code',
      value: 'Cost Code 1',
    },
  ],
  started_at: undefined,
  ended_at: undefined,
  travel_classes: [],
  distance: undefined,
  distance_unit: undefined,
  locations: [optionsData15.options[0].value, optionsData33.options[0].value],
});

export const generatedFormPropertiesData4: GeneratedFormProperties = deepFreeze({
  ...generatedFormPropertiesData3,
  source_account_id: apiExpenses3[1].source_account_id,
  amount: apiExpenses3[1].amount,
});

export const generatedFormPropertiesData5: GeneratedFormProperties = deepFreeze({
  source_account_id: 'acc7F6bwRa52p',
  is_billable: undefined,
  amount: apiExpenses3[1].amount,
  project_id: 13795,
  cost_center_id: 13796,
  tax_amount: undefined,
  tax_group_id: undefined,
  category_id: undefined,
  merchant: undefined,
  purpose: undefined,
  spent_at: undefined,
  file_ids: [],
  custom_fields: [],
  started_at: undefined,
  ended_at: undefined,
  travel_classes: [],
  distance: undefined,
  distance_unit: undefined,
  locations: [optionsData15.options[0].value, optionsData33.options[0].value],
});
