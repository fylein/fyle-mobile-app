import { CustomField } from '../models/custom_field.model';

export const customFields: CustomField[] = [
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
];

export const customField2 = [
  {
    id: 115,
    name: 'test date',
    value: '2023-02-23T16:24:01.335Z',
    type: 'DATE',
  },
];

export const customFieldData1: CustomField[] = [
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
];

export const customFieldData2: CustomField[] = [
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
];

export const expectedCustomField = [
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
];

export const expectedCustomFieldsWoDate = [
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
];

export const expectedCustomFieldsWithDate = [
  {
    id: 115,
    name: 'test date',
    value: new Date('2023-02-23T16:24:01.335Z'),
    type: 'DATE',
  },
];
