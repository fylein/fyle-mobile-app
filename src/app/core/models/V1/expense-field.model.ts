import { FieldCreatedBy } from "./field-created-by.model";

export interface ExpenseField {
  code: string;
  column_name: string;
  created_at: Date;
  created_by: FieldCreatedBy;
  default_value: string;
  field_name: string;
  id?: number;
  is_custom: boolean;
  is_enabled: boolean;
  is_mandatory: boolean;
  options: any[];
  org_category_ids: number[];
  org_id: string;
  placeholder: string;
  roles_editable: string[];
  seq: number;
  type: string;
  updated_at: Date;
  updated_by: Date;
}
