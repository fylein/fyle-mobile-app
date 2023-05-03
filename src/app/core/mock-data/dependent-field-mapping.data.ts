import { CustomProperty } from '../models/custom-properties.model';

interface dependentFieldMapping {
  [fieldId: number]: CustomProperty<string>[];
}

export const dependentFieldsMappingForProject: dependentFieldMapping = {
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

export const dependentFieldsMappingForSameProject: dependentFieldMapping = {
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

export const dependentFieldsMappingForNoDependentFields: dependentFieldMapping = {
  316992: [],
};

export const dependentFieldsMappingForCostCenter: dependentFieldMapping = {
  16743: [
    {
      name: 'Dependent Field Of Cost Center',
      value: 'Dep. Value 1',
    },
  ],
  16744: [
    {
      name: 'Dependent Field Of Cost Center',
      value: 'Dep. Value 3',
    },
  ],
};
