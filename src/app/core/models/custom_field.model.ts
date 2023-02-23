export interface CustomField {
  id?: number;
  name: string;
  value: any;
  type?: string;
  displayValue?: string;
  mandatory?: boolean;
  options?: string[];
  placeholder?: string;
  parent_field_id?: number;
  prefix?: string;
}
