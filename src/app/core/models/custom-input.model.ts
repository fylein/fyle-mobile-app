export interface CustomInput {
  id: number;
  mandatory: boolean;
  name: string;
  options: string[];
  placeholder: string;
  prefix: string;
  type: string;
  value: string;
  parent_field_id?: number;
}
