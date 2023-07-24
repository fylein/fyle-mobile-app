import { CustomProperty } from '../models/custom-properties.model';
import { DependentFieldValuesApiParams } from '../models/platform/dependent-field-values-api-params.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformDependentFieldValue } from '../models/platform/platform-dependent-field-value.model';
import { ExpenseField } from '../models/v1/expense-field.model';

export const dependentFieldValuesMethodParams = {
  fieldId: 219199,
  parentFieldId: 219175,
  parentFieldValue: 'Project 1',
};

export const dependentFieldValuesApiParams: DependentFieldValuesApiParams = {
  params: {
    expense_field_id: 'eq.219199',
    parent_expense_field_id: 'eq.219175',
    parent_expense_field_value: `eq."Project 1"`,
    is_enabled: 'eq.true',
    offset: 0,
    limit: 20,
    order: 'expense_field_value.asc',
  },
};

export const dependentFieldValuesApiResponse: PlatformApiResponse<PlatformDependentFieldValue> = {
  count: 2,
  data: [
    {
      created_at: '2023-02-23T10:50:38.058403+00:00',
      expense_field_id: 219199,
      expense_field_value: 'Cost Code 1',
      id: 4,
      is_enabled: true,
      org_id: 'orN6GkZNaD8b',
      parent_expense_field_id: 219175,
      parent_expense_field_value: 'Project 1',
      updated_at: '2023-02-23T10:51:06.155705+00:00',
    },
    {
      created_at: '2023-02-23T10:50:56.756648+00:00',
      expense_field_id: 219199,
      expense_field_value: 'Cost Code 2',
      id: 8,
      is_enabled: true,
      org_id: 'orN6GkZNaD8b',
      parent_expense_field_id: 219175,
      parent_expense_field_value: 'Project 1',
      updated_at: '2023-02-23T10:51:06.155705+00:00',
    },
  ],
  offset: 0,
};

export const dependentFieldValuesWithSearchQueryMethodParams = {
  fieldId: 219199,
  parentFieldId: 219175,
  parentFieldValue: 'Project 1',
  searchQuery: 'code 2',
};

export const dependentFieldValuesWithSearchQueryApiParams: DependentFieldValuesApiParams = {
  params: {
    expense_field_id: 'eq.219199',
    expense_field_value: `ilike."%code 2%"`,
    parent_expense_field_id: 'eq.219175',
    parent_expense_field_value: `eq."Project 1"`,
    is_enabled: 'eq.true',
    offset: 0,
    limit: 20,
    order: 'expense_field_value.asc',
  },
};

export const dependentFieldValuesApiResponseForSearchQuery: PlatformApiResponse<PlatformDependentFieldValue> = {
  count: 1,
  data: [
    {
      created_at: '2023-02-23T10:50:56.756648+00:00',
      expense_field_id: 219199,
      expense_field_value: 'Cost Code 2',
      id: 8,
      is_enabled: true,
      org_id: 'orN6GkZNaD8b',
      parent_expense_field_id: 219175,
      parent_expense_field_value: 'Project 1',
      updated_at: '2023-02-23T10:51:06.155705+00:00',
    },
  ],
  offset: 0,
};

export const customExpenseFields: ExpenseField[] = [
  {
    id: 219199,
    code: null,
    column_name: 'Cost Code',
    created_at: new Date('2023-02-23T10:45:08.313777+00:00'),
    default_value: null,
    field_name: 'Cost Code',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Enter Cost Code',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-02-23T10:45:08.313777+00:00'),
    parent_field_id: 219175,
  },
  {
    id: 219200,
    code: null,
    column_name: 'Cost Area',
    created_at: new Date('2023-02-23T10:45:53.853907+00:00'),
    default_value: null,
    field_name: 'Cost Area',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Enter Cost Area',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-02-23T10:45:53.853907+00:00'),
    parent_field_id: 219199,
  },
  {
    id: 219234,
    code: null,
    column_name: 'text_column1',
    created_at: new Date('2023-02-27T12:33:04.677547+00:00'),
    default_value: null,
    field_name: 'CUSTOM FIELD',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: ['q', 'qe', 'qwwq'],
    org_category_ids: [],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'select field',
    seq: 1,
    type: 'SELECT',
    updated_at: new Date('2023-03-02T10:23:04.450557+00:00'),
    parent_field_id: null,
  },
  {
    id: 219527,
    code: null,
    column_name: 'Taj Mahaj Construction',
    created_at: new Date('2023-03-01T13:12:32.545615+00:00'),
    default_value: null,
    field_name: 'Taj Mahaj Construction',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: ['Materials'],
    org_category_ids: [],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Select Taj Mahaj Construction',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-03-01T13:12:32.545615+00:00'),
    parent_field_id: 219174,
  },
  {
    id: 220339,
    code: null,
    column_name: 'text_column3',
    created_at: new Date('2023-03-17T12:29:13.566689+00:00'),
    default_value: null,
    field_name: 'Some custom field',
    is_custom: true,
    is_enabled: true,
    is_mandatory: true,
    options: [],
    org_category_ids: [251108, 251111, 251113],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Select Value',
    seq: 1,
    type: 'TEXT',
    updated_at: new Date('2023-03-17T12:29:13.566689+00:00'),
    parent_field_id: null,
  },
];

export const dependentExpenseFields: ExpenseField[] = [
  {
    id: 219199,
    code: null,
    column_name: 'Cost Code',
    created_at: new Date('2023-02-23T10:45:08.313777+00:00'),
    default_value: null,
    field_name: 'Cost Code',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Enter Cost Code',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-02-23T10:45:08.313777+00:00'),
    parent_field_id: 219175,
  },
  {
    id: 219200,
    code: null,
    column_name: 'Cost Area',
    created_at: new Date('2023-02-23T10:45:53.853907+00:00'),
    default_value: null,
    field_name: 'Cost Area',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Enter Cost Area',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-02-23T10:45:53.853907+00:00'),
    parent_field_id: 219199,
  },
];

export const txnCustomProperties: CustomProperty<string>[] = [
  {
    name: 'CUSTOM FIELD',
    value: 'qwwq',
  },
  {
    name: 'Cost Code',
    value: 'Wow this Works',
  },
  {
    name: 'Cost Area',
    value: null,
  },
];

export const dependentFieldValues: CustomProperty<string>[] = [
  {
    name: 'Cost Code',
    value: 'Wow this Works',
  },
  {
    name: 'Cost Area',
    value: '-',
  },
];

export const txnCustomProperties2: CustomProperty<string | Date>[] = [
  {
    name: 'CUSTOM FIELD',
    value: 'qwwq',
  },
  {
    name: 'Cost Code',
    value: 'Wow this Works',
  },
  {
    name: 'Cost Area',
    value: null,
  },
  {
    name: 'Expense Date',
    value: '2022-07-06T10:07:27.334887',
  },
];
