export interface MatchedExpense {
  id: string;
  currency: string;
  amount: number;
  spent_at: string;
  txn_dt: string;
  merchant: string;
  vendor: string;
  foreign_currency: string;
  foreign_amount: number;
  purpose: string;
  state: string;
  seq_num: string;
  no_of_files: number;
  category_display_name: string;
}
