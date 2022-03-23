import { FormControl } from '@angular/forms';
import { Option } from './option.type';

export type CustomInputs = Partial<{
  control: FormControl;
  id: string;
  mandatory: boolean;
  name: string;
  options: Option[];
  placeholder: string;
  prefix: string;
  type: string;
  value: string;
}>;
