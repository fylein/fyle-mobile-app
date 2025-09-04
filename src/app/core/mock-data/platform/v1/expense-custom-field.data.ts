import deepFreeze from 'deep-freeze-strict';

export const expenseCustomFieldsWithDependentFields1 = deepFreeze([
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
  {
    name: 'Dependent Field Of Cost Center',
    value: 'Dep. Value 3',
  },
]);

export const expenseCustomFieldsWithDependentFields2 = deepFreeze([
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
  {
    name: 'Dependent Field Of Cost Center',
    value: 'Dep. Value 1',
  },
]);
