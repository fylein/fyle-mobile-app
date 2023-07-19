import { CustomProperty } from './custom-properties.model';

export interface CostCenterDependentFieldsMapping {
  [costCenterId: number]: CustomProperty<string>[];
}
