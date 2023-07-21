import { CustomProperty } from './custom-properties.model';

export interface DependentFieldsMapping {
  [projectId: number]: CustomProperty<string | string[]>[];
}
