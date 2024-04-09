import { AbstractControl } from '@angular/forms';

export interface CustomField {
  id?: number;
  name: string;
  value: string | boolean | number | Date | string[] | { display: string };
  type?: string;
  displayValue?: string | boolean | number | Date | string[] | { display: string };
  mandatory?: boolean;
  control?: AbstractControl;
}
