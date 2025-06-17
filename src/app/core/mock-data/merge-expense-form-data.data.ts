import deepFreeze from 'deep-freeze-strict';

import { optionsData15, optionsData33 } from './merge-expenses-options-data.data';

export const mergeExpenseFormData1 = deepFreeze({
  genericFields: {
    paymentMode: 'CORPORATE_CARD',
    amount: 'tx3nHShG60zq',
    project: 13795,
    costCenter: 13796,
  },
  custom_inputs: {
    fields: [
      {
        name: 'CUSTOM FIELD',
        value: '',
      },
      {
        name: 'Cost Code',
        value: 'Cost Code 1',
      },
    ],
  },
  categoryDependent: {
    location_1: optionsData15.options[0].value,
    location_2: optionsData33.options[0].value,
  },
});

export const mergeExpenseFormData2 = deepFreeze({
  genericFields: {
    paymentMode: 'CORPORATE_CARD',
    amount: 'tx3nHShG60zq',
    project: 13795,
    costCenter: 13796,
  },
  custom_inputs: {
    fields: [
      {
        name: 'CUSTOM FIELD',
        value: '',
      },
      {
        name: 'Cost Code',
        value: 'Cost Code 1',
      },
    ],
  },
  categoryDependent: {
    location_1: optionsData15.options[0].value,
  },
});

export const mergeExpenseFormData3 = deepFreeze({
  genericFields: {
    paymentMode: 'CORPORATE_CARD',
    amount: 'tx3nHShG60zq',
    project: 13795,
    costCenter: 13796,
  },
  custom_inputs: {
    fields: [
      {
        name: 'CUSTOM FIELD',
        value: '',
      },
      {
        name: 'Cost Code',
        value: 'Cost Code 1',
      },
    ],
  },
  categoryDependent: {},
});

export const mergeExpenseFormData4 = deepFreeze({
  genericFields: {
    paymentMode: 'CORPORATE_CARD',
    amount: 'tx3nHShG60zq',
  },
  custom_inputs: {
    fields: [
      {
        name: 'CUSTOM FIELD',
        value: '',
      },
      {
        name: 'Cost Code',
        value: 'Cost Code 1',
      },
    ],
  },
  categoryDependent: {
    location_1: optionsData15.options[0].value,
    location_2: optionsData33.options[0].value,
  },
});

export const mergeExpenseFormData5 = deepFreeze({
  genericFields: {
    paymentMode: 'CORPORATE_CARD',
    amount: 'tx3nHShG6035',
  },
  custom_inputs: {
    fields: [
      {
        name: 'CUSTOM FIELD',
        value: '',
      },
      {
        name: 'Cost Code',
        value: 'Cost Code 1',
      },
    ],
  },
  categoryDependent: {
    location_1: optionsData15.options[0].value,
    location_2: optionsData33.options[0].value,
  },
});
