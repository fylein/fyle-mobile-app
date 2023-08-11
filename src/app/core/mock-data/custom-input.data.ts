import { CustomInput } from '../models/custom-input.model';

export const customInputData1: Partial<CustomInput>[] = [
  {
    id: 200227,
    name: 'userlist',
    options: [],
    value: [],
  },
  {
    id: 210649,
    name: 'User List',
    options: [],
    value: [],
  },
  {
    id: 210281,
    name: 'test',
    options: [],
    value: '',
  },
  {
    id: 212819,
    name: 'category2',
    options: [],
    value: '',
  },
  {
    id: 206206,
    name: 'pub create hola 1',
    options: [],
    value: null,
  },
  {
    id: 211321,
    name: 'test 112',
    options: [],
    value: null,
  },
  {
    id: 206198,
    name: '2232323',
    options: [],
    value: null,
  },
  {
    id: 211326,
    name: 'select all 2',
    options: [
      {
        label: '2023-02-13T17:00:00.000Z',
        value: '2023-02-13T17:00:00.000Z',
      },
    ],
    value: '2023-02-13T17:00:00.000Z',
  },
];

export const expectedCustomInputs: Partial<CustomInput>[] = [
  {
    id: 211326,
    options: [],
    placeholder: 'helo date',
    type: 'DATE',
    value: null,
    mandatory: undefined,
    name: undefined,
    prefix: undefined,
  },
  {
    id: 218265,
    options: [],
    placeholder: 'Boolean value',
    type: 'BOOLEAN',
    value: null,
    mandatory: undefined,
    name: undefined,
    prefix: undefined,
  },
  {
    name: 'CUSTOM FIELD',
    value: 'custom field',
  },
  {
    name: 'Cost Code',
    value: 'Wow this Works',
  },
];
