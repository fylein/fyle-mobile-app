export interface PlatformExpenseField {
  category_ids: number[];
  code: string;
  column_name: string;
  created_at: Date;
  default_value: string | boolean;
  field_name: string;
  id: number;
  is_custom: boolean;
  is_enabled: boolean;
  is_mandatory: boolean;
  options: string[];
  org_id: string;
  parent_field_id?: number;
  placeholder: string;
  seq: number;
  type: string;
  updated_at: Date;
}
