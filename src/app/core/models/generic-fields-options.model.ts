import { MergeExpensesOptionsData } from './merge-expenses-options-data.model';

export interface GenericFieldsOptions {
  amountOptionsData: MergeExpensesOptionsData<string>;
  dateOfSpendOptionsData: MergeExpensesOptionsData<Date>;
  paymentModeOptionsData: MergeExpensesOptionsData<string>;
  projectOptionsData: MergeExpensesOptionsData<number>;
  billableOptionsData: MergeExpensesOptionsData<boolean>;
  categoryOptionsData: MergeExpensesOptionsData<number>;
  vendorOptionsData: MergeExpensesOptionsData<string>;
  taxGroupOptionsData: MergeExpensesOptionsData<string>;
  taxAmountOptionsData: MergeExpensesOptionsData<number>;
  constCenterOptionsData: MergeExpensesOptionsData<number>;
  purposeOptionsData: MergeExpensesOptionsData<string>;
}
