import { CustomInputOptions } from './custom-input-options.model';

export interface CustomInput {
  id: number;
  mandatory: boolean;
  name: string;
  options: string[] | CustomInputOptions[];
  placeholder: string;
  prefix: string;
  type: string;
  value: string | string[] | boolean | Date | number | { display: string };
  parent_field_id: number;
  displayValue: string;
  areSameValues?: boolean;
}
