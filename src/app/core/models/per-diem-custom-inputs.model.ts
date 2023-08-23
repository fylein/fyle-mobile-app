import { AbstractControl } from '@angular/forms';
import { TxnCustomProperties } from './txn-custom-properties.model';

export interface PerDiemCustomInputs extends TxnCustomProperties {
  control: AbstractControl;
}
