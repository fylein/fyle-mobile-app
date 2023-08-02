import { UserDetails } from './user-details.model';

export interface ExpenseField {
  code: string;
  column_name: string;
  created_at: Date;
  created_by?: UserDetails;
  default_value: string | boolean;
  field_name?: string;
  id?: number;
  is_custom: boolean;
  is_enabled: boolean;
  is_mandatory?: boolean;
  options?: string[] | { label: string; value: string }[];
  org_category_ids: number[];
  org_id: string;
  placeholder: string;
  roles_editable?: string[];
  seq: number;
  type: string;
  updated_at: Date;
  parent_field_id?: number;
  updated_by?: UserDetails;
  field?: string;
  input_type?: string;
}
