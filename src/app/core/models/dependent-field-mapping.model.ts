import { CustomInput } from './custom-input.model';

export interface DependentFieldsMapping {
  [projectId: number]: Partial<CustomInput>[];
}
