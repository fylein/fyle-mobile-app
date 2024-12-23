import { AbstractControl } from '@angular/forms';
import { CustomInputsOption } from './custom-inputs-option.model';

export interface TxnCustomProperties {
  id?: number;
  mandatory?: boolean;
  name: string;
  options?: CustomInputsOption[] | string[];
  placeholder?: string;
  prefix?: string;
  type?: string;
  value: string | string[] | boolean | Date | number | { display?: string };
  parent_field_id?: number;
  label?: string;
  control?: AbstractControl;
  is_enabled?: boolean;
}
