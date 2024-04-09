import { AbstractControl } from '@angular/forms';
import { Option } from 'src/app/shared/components/fy-select/fy-select-modal/fy-select-modal.interface';

export interface CustomInputsField {
  control: AbstractControl;
  id: string;
  mandatory: boolean;
  name: string;
  options: Option[];
  placeholder: string;
  prefix: string;
  type: string;
  value: string;
}
