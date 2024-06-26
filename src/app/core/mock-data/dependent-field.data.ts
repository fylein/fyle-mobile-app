import deepFreeze from 'deep-freeze-strict';

import { TxnCustomProperties } from '../models/txn-custom-properties.model';

export const projectDependentFields: TxnCustomProperties[] = deepFreeze([
  {
    id: 218227,
    prefix: '',
    name: 'CF1',
    value: null,
    placeholder: 'CF1',
    type: 'DEPENDENT_SELECT',
    mandatory: true,
    options: ['CF1.1', 'CF1.2', 'CF1.3', 'CF1.4', 'CF1.5'],
    parent_field_id: 214662,
  },
  {
    id: 218228,
    prefix: '',
    name: 'CF2',
    value: null,
    placeholder: 'CF2',
    type: 'DEPENDENT_SELECT',
    mandatory: true,
    options: ['CF2.1', 'CF2.2', 'CF2.3', 'CF2.4', 'CF2.5'],
    parent_field_id: 218227,
  },
  {
    id: 218229,
    prefix: '',
    name: 'CF3',
    value: null,
    placeholder: 'CF3',
    type: 'DEPENDENT_SELECT',
    mandatory: true,
    options: ['CF3.1', 'CF3.2', 'CF3.3', 'CF3.4', 'CF3.5'],
    parent_field_id: 218228,
  },
  {
    id: 218230,
    prefix: '',
    name: 'CF4',
    value: null,
    placeholder: 'CF4',
    type: 'DEPENDENT_SELECT',
    mandatory: false,
    options: ['CF4.1', 'CF4.2', 'CF4.3', 'CF4.4', 'CF4.5'],
    parent_field_id: 218229,
  },
  {
    id: 218231,
    prefix: '',
    name: 'CF5',
    value: null,
    placeholder: 'CF5',
    type: 'DEPENDENT_SELECT',
    mandatory: false,
    options: ['CF5.1', 'CF5.2', 'CF5.3', 'CF5.4', 'CF5.5'],
    parent_field_id: 218230,
  },
]);

export const costCenterDependentFields: TxnCustomProperties[] = deepFreeze([
  {
    id: 221308,
    prefix: '',
    name: 'Dependent Field Of Cost Center',
    value: null,
    placeholder: 'Select value',
    type: 'DEPENDENT_SELECT',
    mandatory: false,
    options: [],
    parent_field_id: 221283,
  },
]);
