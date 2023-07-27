export interface TxnCustomProperties {
  id?: number;
  mandatory?: boolean;
  name: string;
  options?: CustomInputsOption[] | string[];
  placeholder?: string;
  prefix?: string;
  type?: string;
  value: string | number | Date | string[] | number[] | boolean;
  parent_field_id?: number;
}

export interface CustomInputsOption {
  id?: number;
  mandatory?: boolean;
  name?: string;
  options?: string[];
  placeholder?: string;
  prefix?: string;
  type?: string;
  label: string;
  value: string;
}
