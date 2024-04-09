import { CustomProperty } from './custom-properties.model';

export interface ProjectDependentFieldsMapping {
  [projectId: number]: CustomProperty<string | string[]>[];
}
