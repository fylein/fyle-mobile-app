import { FormBuilder } from '@angular/forms';
const formBuilder = new FormBuilder();

export const perDiemCustomInputsData1 = [
  {
    id: 200227,
    mandatory: false,
    name: 'userlist',
    options: [],
    placeholder: 'userlist_custom_field',
    prefix: '',
    // TODO - Move to enums
    type: 'USER_LIST',
    value: [],
    control: formBuilder.group({
      name: 'userlist',
      value: [[]],
    }),
  },
  {
    id: 210281,
    mandatory: false,
    name: 'test',
    options: [
      {
        label: {
          label: 'asd',
          value: 'asd',
        },
        value: {
          label: 'asd',
          value: 'asd',
        },
      },
      {
        label: {
          label: 'asdf',
          value: 'asdf',
        },
        value: {
          label: 'asdf',
          value: 'asdf',
        },
      },
      {
        label: {
          label: 'asdff',
          value: 'asdff',
        },
        value: {
          label: 'asdff',
          value: 'asdff',
        },
      },
    ],
    placeholder: '123test',
    prefix: '',
    type: 'MULTI_SELECT',
    value: '',
    control: formBuilder.group({
      name: 'test',
      value: '',
    }),
  },
  {
    id: 206206,
    mandatory: false,
    name: 'pub create hola 1',
    options: [],
    placeholder: 'pub create hola 1',
    prefix: '',
    type: 'LOCATION',
    value: null,
    control: formBuilder.group({
      name: 'pub create hola 1',
      value: null,
    }),
  },
  {
    id: 211326,
    mandatory: false,
    name: 'select all 2',
    options: [],
    placeholder: 'helo date',
    prefix: '',
    type: 'DATE',
    value: new Date('2023-02-13T17:00:00.000Z'),
    control: formBuilder.group({
      name: 'select all 2',
      value: '2023-02-13',
    }),
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const expectedExpenseFieldWithoutControl = perDiemCustomInputsData1.map(({ control, ...otherProps }) => ({
  ...otherProps,
}));

export const expectedControlValues = perDiemCustomInputsData1.map(
  ({ control }: { control: { value: string | string[] } }) => control.value
);
