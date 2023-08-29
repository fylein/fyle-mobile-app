import { AbstractControl } from '@angular/forms';

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
  label?: string;
  control?: AbstractControl;
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
