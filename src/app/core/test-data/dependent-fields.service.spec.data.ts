import { DependentFieldValuesApiParams } from '../models/platform/dependent-field-values-api-params.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformDependentFieldValue } from '../models/platform/platform-dependent-field-value.model';

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
