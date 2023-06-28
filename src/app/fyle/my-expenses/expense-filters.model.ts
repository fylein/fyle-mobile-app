import { Filters } from './my-expenses-filters.model';

export interface ExpenseFilters extends Omit<Filters, 'state'> {
  state: string | string[];
  cardNumbers: string[];
  splitExpense: string;
  tx_receipt_required: string;
  tx_policy_flag: string;
  tx_policy_amount: string;
  or: string;
}
