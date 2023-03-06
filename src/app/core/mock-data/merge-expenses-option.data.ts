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
