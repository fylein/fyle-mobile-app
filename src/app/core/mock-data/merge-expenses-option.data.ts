import deepFreeze from 'deep-freeze-strict';

import { AccountType } from '../enums/account-type.enum';
import { MergeExpensesOption } from '../models/merge-expenses-option.model';

export const billableOptions1: MergeExpensesOption<boolean> = deepFreeze({
  label: 'Yes',
  value: true,
});

export const billableOptions2: MergeExpensesOption<boolean> = deepFreeze({
  label: 'No',
  value: false,
});

export const paymentModeOptions1: MergeExpensesOption<string> = deepFreeze({
  label: 'Personal Card/Cash',
  value: AccountType.PERSONAL,
});

export const paymentModeOptions2: MergeExpensesOption<string> = deepFreeze({
  label: 'Advance',
  value: AccountType.ADVANCE,
});

export const paymentModeOptions3: MergeExpensesOption<string> = deepFreeze({
  label: 'Corporate Card',
  value: AccountType.CCC,
});

export const sameOptions: MergeExpensesOption<boolean>[] = deepFreeze([billableOptions1, billableOptions1]);

export const projectOptionsData: MergeExpensesOption<number> = deepFreeze({
  label: 'Staging Project',
  value: 3943,
});

export const categoryOptionsData: MergeExpensesOption<number>[] = deepFreeze([
  {
    label: 'Food / Travelling - Inland',
    value: 201952,
  },
  {
    label: 'Unspecified',
    value: 16582,
  },
]);

export const mergeExpensesOptionData3: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: 'Staging Project',
    value: '3943',
  },
  {
    label: 'Staging Project',
    value: '3943',
  },
]);

export const mergeExpensesOptionData4: MergeExpensesOption<number>[] = deepFreeze([
  {
    label: 'Food',
    value: 201952,
  },
  {
    label: 'Hotel',
    value: 16582,
  },
]);

export const mergeExpensesOptionData5: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: 'GST',
    value: 'tgXEJA6YUoZ1',
  },
  {
    label: 'GST',
    value: 'tgXEJA6YUoZ1',
  },
]);

export const mergeExpensesOptionData6: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: 'ECONOMY',
    value: 'ECONOMY',
  },
  {
    label: 'BUSINESS',
    value: 'BUSINESS',
  },
]);

export const mergeExpensesOptionData7: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: 'SLEEPER',
    value: 'SLEEPER',
  },
  {
    label: 'SLEEPER',
    value: 'SLEEPER',
  },
]);

export const mergeExpensesOptionData8: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: 'AC',
    value: 'AC',
  },
  {
    label: 'AC',
    value: 'AC',
  },
]);

export const mergeExpensesOptionData9: MergeExpensesOption<number>[] = deepFreeze([
  {
    label: '25',
    value: 25,
  },
  {
    label: '30',
    value: 30,
  },
]);

export const mergeExpensesOptionData10: MergeExpensesOption<string>[] = deepFreeze([
  {
    label: 'KM',
    value: 'KM',
  },
  {
    label: 'MILES',
    value: 'MILES',
  },
]);
