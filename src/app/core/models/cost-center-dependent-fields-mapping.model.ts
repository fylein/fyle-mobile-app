import { CustomInput } from './custom-input.model';

export interface CostCenterDependentFieldsMapping {
  [costCenterId: number]: Partial<CustomInput>[];
}
