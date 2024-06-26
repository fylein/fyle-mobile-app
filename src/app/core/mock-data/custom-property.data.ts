import deepFreeze from 'deep-freeze-strict';

import { CustomProperty } from '../models/custom-properties.model';

export const customPropertiesData: CustomProperty<string | string[]>[] = deepFreeze([
  {
    name: 'userlist',
    value: [],
  },
  {
    name: 'User List',
    value: [],
  },
  {
    name: 'test date',
    value: '',
  },
  {
    name: 'category2',
    value: '',
  },
  {
    name: 'pub create hola 1',
    value: null,
  },
  {
    name: 'test 112',
    value: null,
  },
  {
    name: '2232323',
    value: null,
  },
  {
    name: 'select all 2',
    value: '2023-02-05T09:48:18.482566+00:00',
  },
]);

export const dependentCustomProperties: CustomProperty<string>[] = deepFreeze([
  {
    name: 'CUSTOM FIELD',
    value: '',
  },
  {
    name: 'Cost Code',
    value: 'Cost Code 1',
  },
  {
    name: 'Cost Area',
    value: null,
  },
  {
    name: 'Taj Mahaj Construction',
    value: null,
  },
]);

export const dependentCustomProperties2: CustomProperty<string | Date>[] = deepFreeze([
  ...dependentCustomProperties,
  {
    name: 'date property',
    value: new Date(),
  },
]);
