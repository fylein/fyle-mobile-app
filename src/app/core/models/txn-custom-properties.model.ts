export interface TxnCustomProperties {
  id?: number;
  mandatory?: boolean;
  name: string;
  options?: CustomInputsOption[] | string[];
  placeholder?: string;
  prefix?: string;
  type?: string;
  value: any;
  parent_field_id?: number;
}

export interface CustomInputsOption {
  label: string;
  value: string;
}
