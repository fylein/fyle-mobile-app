import { ExpenseState } from './expense-state.enum';

export interface MatchedExpense {
  id: string;
  currency: string;
  amount: number;
  spent_at: Date;
  txn_dt: Date;
  merchant: string;
  vendor: string;
  foreign_currency: string;
  foreign_amount: number;
  purpose: string;
  state: ExpenseState;
  seq_num: string;
  no_of_files: number;
  category_display_name: string;
}
