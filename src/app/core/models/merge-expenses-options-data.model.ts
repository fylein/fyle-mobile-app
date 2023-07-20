import { MergeExpensesOption } from './merge-expenses-option.model';

export interface MergeExpensesOptionsData<T> {
  options?: MergeExpensesOption<T>[];
  areSameValues?: boolean;
  name?: string;
  value?: T; // Value can be anything number, string, list, etc.
  id?: number;
}
