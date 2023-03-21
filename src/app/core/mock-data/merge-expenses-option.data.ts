import { AccountType } from '../enums/account-type.enum';
import { MergeExpensesOption } from '../models/merge-expenses-option.model';

export const billableOptions1: MergeExpensesOption = {
  label: 'Yes',
  value: true,
};

export const billableOptions2: MergeExpensesOption = {
  label: 'No',
  value: false,
};

export const paymentModeOptions1: MergeExpensesOption = {
  label: 'Personal Card/Cash',
  value: AccountType.PERSONAL,
};

export const paymentModeOptions2: MergeExpensesOption = {
  label: 'Advance',
  value: AccountType.ADVANCE,
};

export const paymentModeOptions3: MergeExpensesOption = {
  label: 'Corporate Card',
  value: AccountType.CCC,
};

export const sameOptions: MergeExpensesOption[] = [billableOptions1, billableOptions1];

export const mergeExpensesOptionsData: MergeExpensesOption[] = [
  {
    label: 'Receipt From Expense 1 ',
    value: 'tx3nHShG60zq',
  },
];

export const projectOptionsData: MergeExpensesOption = {
  label: 'Staging Project',
  value: 3943,
};

export const categoryOptionsData: MergeExpensesOption[] = [
  {
    label: 'Food / Travelling - Inland',
    value: 201952,
  },
  {
    label: 'Unspecified',
    value: 16582,
  },
];

export const mergeExpensesOptionData1: MergeExpensesOption[] = [
  {
    label: 'Mar 13 ₹1.00 Nilesh As Vendor - Staging Project',
    value: 'txKJAJ1flx7n',
  },
  {
    label: 'Mar 08 ₹1.00 Nilesh As Vendor - Staging Project',
    value: 'txz2vohKxBXu',
  },
];

export const mergeExpensesOptionData2: MergeExpensesOption[] = [
  {
    label: '  Nilesh As Vendor - Staging Project',
    value: 'txKJAJ1flx7n',
  },
  {
    label: '  Nilesh As Vendor - Staging Project',
    value: 'txz2vohKxBXu',
  },
];

export const mergeExpensesOptionData3: MergeExpensesOption[] = [
  {
    label: 'Staging Project',
    value: '3943',
  },
  {
    label: 'Staging Project',
    value: '3943',
  },
];

export const mergeExpensesOptionData4: MergeExpensesOption[] = [
  {
    label: 'Food',
    value: '201952',
  },
  {
    label: 'Hotel',
    value: '16582',
  },
];

export const mergeExpensesOptionData5: MergeExpensesOption[] = [
  {
    label: 'GST',
    value: 'tgXEJA6YUoZ1',
  },
  {
    label: 'GST',
    value: 'tgXEJA6YUoZ1',
  },
];

export const mergeExpensesOptionData6: MergeExpensesOption[] = [
  {
    label: 'ECONOMY',
    value: 'ECONOMY',
  },
  {
    label: 'BUSINESS',
    value: 'BUSINESS',
  },
];

export const mergeExpensesOptionData7: MergeExpensesOption[] = [
  {
    label: 'SLEEPER',
    value: 'SLEEPER',
  },
  {
    label: 'SLEEPER',
    value: 'SLEEPER',
  },
];

export const mergeExpensesOptionData8: MergeExpensesOption[] = [
  {
    label: 'AC',
    value: 'AC',
  },
  {
    label: 'AC',
    value: 'AC',
  },
];

export const mergeExpensesOptionData9: MergeExpensesOption[] = [
  {
    label: '25',
    value: 25,
  },
  {
    label: '30',
    value: 30,
  },
];

export const mergeExpensesOptionData10: MergeExpensesOption[] = [
  {
    label: 'KM',
    value: 'KM',
  },
  {
    label: 'MILES',
    value: 'MILES',
  },
];
