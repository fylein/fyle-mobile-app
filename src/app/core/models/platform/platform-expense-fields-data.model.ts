export interface PlatformExpenseFieldsData {
  id: number;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  seq: number;
  field_name: string;
  column_name: string;
  type: string;
  options: string[];
  default_value: string;
  placeholder: string;
  category_ids: number[];
  is_enabled: boolean;
  is_custom: boolean;
  is_mandatory: boolean;
  code: string;
}
