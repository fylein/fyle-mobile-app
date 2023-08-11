export interface TxnCustomProperties {
  id?: number;
  mandatory?: boolean;
  name: string;
  options?: CustomInputsOption[] | string[];
  placeholder?: string;
  prefix?: string;
  type?: string;
  value: string | string[] | boolean | Date | number | { display: string };
  parent_field_id?: number;
}

export interface CustomInputsOption {
  label: string;
  value: string;
}
