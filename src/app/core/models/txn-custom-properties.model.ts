export interface TxnCustomProperties {
  id?: number;
  mandatory?: boolean;
  name: string;
  options?: CustomInputsOptions[] | string[];
  placeholder?: string;
  prefix?: string;
  type?: string;
  value: any;
  parent_field_id?: number;
}

export interface CustomInputsOptions {
  label: string;
  value: string;
}
