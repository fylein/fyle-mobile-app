import { CustomProperty } from '../models/custom-properties.model';

interface ProjectDependentFieldMapping {
  [projectId: number]: CustomProperty<string>[];
}

export const projectDependentFieldsMapping: ProjectDependentFieldMapping = {
  316908: [
    {
      name: 'CF1',
      value: 'CF1.3',
    },
    {
      name: 'CF2',
      value: 'CF2.3',
    },
    {
      name: 'CF3',
      value: 'CF3.3',
    },
  ],
  316992: [
    {
      name: 'CF1',
      value: 'CF1.1',
    },
    {
      name: 'CF2',
      value: 'CF2.1',
    },
    {
      name: 'CF3',
      value: null,
    },
  ],
};

export const projectDependentFieldsMappingForSameProject: ProjectDependentFieldMapping = {
  316992: [
    {
      name: 'CF1',
      value: 'CF1.3',
    },
    {
      name: 'CF2',
      value: 'CF2.3',
    },
    {
      name: 'CF3',
      value: 'CF3.3',
    },
  ],
};

export const projectDependentFieldsMappingForNoDependentFields: ProjectDependentFieldMapping = {
  316992: [],
};
