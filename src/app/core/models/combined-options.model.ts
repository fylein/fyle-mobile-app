import { MergeExpensesOptionsData } from './merge-expenses-options-data.model';

export interface CombinedOptions<T> {
  [key: string]: MergeExpensesOptionsData<T>;
}
