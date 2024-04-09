import { DependentFieldOption } from '../models/dependent-field-option.model';

export const dependentFieldOptions: DependentFieldOption[] = [
  {
    label: 'Other Dep. Value 1',
    value: 'Other Dep. Value 1',
    selected: false,
  },
  {
    label: 'Other Dep. Value 2',
    value: 'Other Dep. Value 2',
    selected: false,
  },
  {
    label: 'Other Dep. Value 3',
    value: 'Other Dep. Value 3',
    selected: false,
  },
];

export const dependentFieldOptionsWithoutSelection: DependentFieldOption[] = [
  {
    label: 'None',
    value: null,
    selected: true,
  },
  {
    label: 'Other Dep. Value 1',
    value: 'Other Dep. Value 1',
    selected: false,
  },
  {
    label: 'Other Dep. Value 2',
    value: 'Other Dep. Value 2',
    selected: false,
  },
  {
    label: 'Other Dep. Value 3',
    value: 'Other Dep. Value 3',
    selected: false,
  },
];

export const dependentFieldOptionsWithSelection: DependentFieldOption[] = [
  {
    label: 'None',
    value: null,
    selected: false,
  },
  {
    label: 'Other Dep. Value 1',
    value: 'Other Dep. Value 1',
    selected: true,
  },
  {
    label: 'Other Dep. Value 2',
    value: 'Other Dep. Value 2',
    selected: false,
  },
  {
    label: 'Other Dep. Value 3',
    value: 'Other Dep. Value 3',
    selected: false,
  },
];

export const dependentFieldOptionsWithSelectionNotInList: DependentFieldOption[] = [
  {
    label: 'None',
    value: null,
    selected: false,
  },
  {
    label: 'Other Dep. Value 51',
    value: 'Other Dep. Value 51',
    selected: true,
  },
  {
    label: 'Other Dep. Value 1',
    value: 'Other Dep. Value 1',
    selected: false,
  },
  {
    label: 'Other Dep. Value 2',
    value: 'Other Dep. Value 2',
    selected: false,
  },
  {
    label: 'Other Dep. Value 3',
    value: 'Other Dep. Value 3',
    selected: false,
  },
];
