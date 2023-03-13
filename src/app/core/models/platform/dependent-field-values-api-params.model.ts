export interface DependentFieldValuesApiParams {
  params: {
    expense_field_id: string;
    parent_expense_field_id: string;
    parent_expense_field_value: string;
    expense_field_value?: string;
    is_enabled?: string;
    offset?: number;
    limit?: number;
    order?: string;
  };
}
