import deepFreeze from 'deep-freeze-strict';

import { CustomField } from '../models/custom_field.model';

export const customFields: CustomField[] = deepFreeze([
  {
    id: 111,
    name: 'Test Number',
    value: 121,
    type: 'NUMBER',
  },
  {
    id: 150,
    name: 'checking',
    value: false,
    type: 'BOOLEAN',
  },
]);

export const customField2 = deepFreeze([
  {
    id: 115,
    name: 'test date',
    value: '2023-02-23T16:24:01.335Z',
    type: 'DATE',
  },
]);

export const customFieldData1: CustomField[] = deepFreeze([
  {
    id: 111,
    name: 'Test Number',
    value: 121,
    type: 'NUMBER',
  },
  {
    id: 115,
    name: 'test date',
    value: '2023-02-23T16:24:01.335Z',
    type: 'DATE',
  },
  {
    id: 150,
    name: 'checking',
    value: false,
    type: 'BOOLEAN',
  },
]);

export const customFieldData2: CustomField[] = deepFreeze([
  {
    id: 111,
    name: 'Test Number',
    value: 121,
    type: 'NUMBER',
  },
  {
    id: 115,
    name: 'test date',
    value: '2023-02-23T16:24:01.335Z',
    type: 'DATE',
  },
  {
    id: 150,
    name: 'checking',
    value: false,
    type: 'BOOLEAN',
  },
  {
    id: 151,
    name: 'Select field',
    value: 'select-1',
    type: 'SELECT',
  },
]);

export const expectedCustomField = deepFreeze([
  {
    id: 111,
    name: 'Test Number',
    value: 121,
    type: 'NUMBER',
  },
  {
    id: 115,
    name: 'test date',
    value: new Date('2023-02-23T16:24:01.335Z'),
    type: 'DATE',
  },
  {
    id: 150,
    name: 'checking',
    value: false,
    type: 'BOOLEAN',
  },
]);

export const expectedCustomFieldsWoDate = deepFreeze([
  {
    id: 111,
    name: 'Test Number',
    value: 121,
    type: 'NUMBER',
  },
  {
    id: 150,
    name: 'checking',
    value: false,
    type: 'BOOLEAN',
  },
]);

export const expectedCustomFieldsWithDate = deepFreeze([
  {
    id: 115,
    name: 'test date',
    value: new Date('2023-02-23T16:24:01.335Z'),
    type: 'DATE',
  },
]);

export const expectedCustomInputFields: CustomField[] = deepFreeze([
  {
    name: 'userlist',
    value: 'txKJAJ1flx7n',
  },
  {
    name: 'User List',
    value: null,
  },
  {
    name: 'test',
    value: null,
  },
  {
    name: 'category2',
    value: null,
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
    value: null,
  },
]);
