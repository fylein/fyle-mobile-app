import * as dayjs from 'dayjs';
import { MergeExpensesOptionsData } from '../models/merge-expenses-options-data.model';

export const optionsData2: MergeExpensesOptionsData = {
  options: [
    {
      label: 'No',
      value: false,
    },
  ],
  areSameValues: false,
};

export const optionsData3: MergeExpensesOptionsData = {
  options: [
    {
      label: 'INR 1',
      value: 'txKJAJ1flx7n',
    },
    {
      label: 'INR 1',
      value: 'txz2vohKxBXu',
    },
  ],
  areSameValues: true,
};

export const optionsData4: MergeExpensesOptionsData = {
  options: [
    {
      label: 'USD 1  (INR 1)',
      value: 'txKJAJ1flx7n',
    },
    {
      label: 'USD 1  (INR 1)',
      value: 'txz2vohKxBXu',
    },
  ],
  areSameValues: true,
};

export const optionsData5: MergeExpensesOptionsData = {
  options: [
    {
      label: '0',
      value: 'txKJAJ1flx7n',
    },
    {
      label: '0',
      value: 'txz2vohKxBXu',
    },
  ],
  areSameValues: true,
};

export const optionsData6: MergeExpensesOptionsData = {
  options: [
    {
      label: 'Mar 13, 2023',
      value: new Date('2023-03-13T11:30:00.000Z'),
    },
    {
      label: 'Mar 08, 2023',
      value: new Date('2023-03-08T11:30:00.000Z'),
    },
  ],
  areSameValues: false,
};

export const optionsData7: MergeExpensesOptionsData = {
  options: [
    {
      label: 'Corporate Card',
      value: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
    },
    {
      label: 'Advance',
      value: 'PERSONAL_ADVANCE_ACCOUNT',
    },
  ],
  areSameValues: false,
};

export const optionsData8: MergeExpensesOptionsData = {
  options: [
    {
      label: 'Nilesh As Vendor',
      value: 'Nilesh As Vendor',
    },
    {
      label: 'Nilesh As Vendor',
      value: 'Nilesh As Vendor',
    },
  ],
  areSameValues: true,
};

export const optionsData9: MergeExpensesOptionsData = {
  options: [
    {
      label: 'Staging Project',
      value: '3943',
    },
    {
      label: 'Staging Project',
      value: '3943',
    },
  ],
  areSameValues: true,
};

export const optionsData10: MergeExpensesOptionsData = {
  options: [
    {
      label: 'Food',
      value: '201952',
    },
    {
      label: 'Hotel',
      value: '16582',
    },
  ],
  areSameValues: false,
};

export const optionsData11: MergeExpensesOptionsData = {
  options: [
    {
      label: '23',
      value: 'tgXEJA6YUoZ1',
    },
    {
      label: '23',
      value: 'tgXEJA6YUoZ1',
    },
  ],
  areSameValues: true,
};

export const optionsData12: MergeExpensesOptionsData = {
  options: [
    {
      label: '0.01',
      value: 0.01,
    },
    {
      label: '0.01',
      value: 0.01,
    },
  ],
  areSameValues: true,
};

export const optionsData13: MergeExpensesOptionsData = {
  options: [
    {
      label: 'Cost Center 1',
      value: 13788,
    },
    {
      label: 'Cost Center 2',
      value: 13795,
    },
  ],
  areSameValues: false,
};

export const optionsData14: MergeExpensesOptionsData = {
  options: [
    {
      label: 'Outing',
      value: 'Outing',
    },
    {
      label: 'Offsite',
      value: 'Offsite',
    },
  ],
  areSameValues: false,
};
