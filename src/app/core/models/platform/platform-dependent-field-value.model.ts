export interface PlatformDependentFieldValue {
  id: number;
  created_at: string;
  updated_at: string;
  org_id: string;
  is_enabled: boolean;
  parent_expense_field_id: number;
  parent_expense_field_value: string;
  expense_field_id: number;
  expense_field_value: string;
}
