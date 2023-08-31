import { AccountType } from '../enums/account-type.enum';
import { MergeExpensesOption } from '../models/merge-expenses-option.model';

export const billableOptions1: MergeExpensesOption<boolean> = {
  label: 'Yes',
  value: true,
};

export const billableOptions2: MergeExpensesOption<boolean> = {
  label: 'No',
  value: false,
};

export const paymentModeOptions1: MergeExpensesOption<string> = {
  label: 'Personal Card/Cash',
  value: AccountType.PERSONAL,
};

export const paymentModeOptions2: MergeExpensesOption<string> = {
  label: 'Advance',
  value: AccountType.ADVANCE,
};

export const paymentModeOptions3: MergeExpensesOption<string> = {
  label: 'Corporate Card',
  value: AccountType.CCC,
};

export const sameOptions: MergeExpensesOption<boolean>[] = [billableOptions1, billableOptions1];

export const mergeExpensesOptionsData: MergeExpensesOption<string>[] = [
  {
    label: 'Receipt From Expense 1 ',
    value: 'tx3nHShG60zq',
  },
];

export const projectOptionsData: MergeExpensesOption<number> = {
  label: 'Staging Project',
  value: 3943,
};

export const categoryOptionsData: MergeExpensesOption<number>[] = [
  {
    label: 'Food / Travelling - Inland',
    value: 201952,
  },
  {
    label: 'Unspecified',
    value: 16582,
  },
];

export const mergeExpensesOptionData1: MergeExpensesOption<string>[] = [
  {
    label: 'Mar 13 ₹1.00 Nilesh As Vendor - Staging Project',
    value: 'txKJAJ1flx7n',
  },
  {
    label: 'Mar 08 ₹1.00 Nilesh As Vendor - Staging Project',
    value: 'txz2vohKxBXu',
  },
];

export const mergeExpensesOptionData2: MergeExpensesOption<string>[] = [
  {
    label: '  Nilesh As Vendor - Staging Project',
    value: 'txKJAJ1flx7n',
  },
  {
    label: '  Nilesh As Vendor - Staging Project',
    value: 'txz2vohKxBXu',
  },
];

export const mergeExpensesOptionData3: MergeExpensesOption<string>[] = [
  {
    label: 'Staging Project',
    value: '3943',
  },
  {
    label: 'Staging Project',
    value: '3943',
  },
];

export const mergeExpensesOptionData4: MergeExpensesOption<number>[] = [
  {
    label: 'Food',
    value: 201952,
  },
  {
    label: 'Hotel',
    value: 16582,
  },
];

export const mergeExpensesOptionData5: MergeExpensesOption<string>[] = [
  {
    label: 'GST',
    value: 'tgXEJA6YUoZ1',
  },
  {
    label: 'GST',
    value: 'tgXEJA6YUoZ1',
  },
];

export const mergeExpensesOptionData6: MergeExpensesOption<string>[] = [
  {
    label: 'ECONOMY',
    value: 'ECONOMY',
  },
  {
    label: 'BUSINESS',
    value: 'BUSINESS',
  },
];

export const mergeExpensesOptionData7: MergeExpensesOption<string>[] = [
  {
    label: 'SLEEPER',
    value: 'SLEEPER',
  },
  {
    label: 'SLEEPER',
    value: 'SLEEPER',
  },
];

export const mergeExpensesOptionData8: MergeExpensesOption<string>[] = [
  {
    label: 'AC',
    value: 'AC',
  },
  {
    label: 'AC',
    value: 'AC',
  },
];

export const mergeExpensesOptionData9: MergeExpensesOption<number>[] = [
  {
    label: '25',
    value: 25,
  },
  {
    label: '30',
    value: 30,
  },
];

export const mergeExpensesOptionData10: MergeExpensesOption<string>[] = [
  {
    label: 'KM',
    value: 'KM',
  },
  {
    label: 'MILES',
    value: 'MILES',
  },
];
