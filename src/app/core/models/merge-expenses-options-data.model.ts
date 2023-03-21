import { MergeExpensesOption } from './merge-expenses-option.model';

export interface MergeExpensesOptionsData {
  options?: MergeExpensesOption[];
  areSameValues?: boolean;
  name?: string;
  value?: any; // Value can be anything number, string, list, etc.
  id?: number;
}
