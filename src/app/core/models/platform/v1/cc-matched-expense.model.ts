export interface CCMatchedExpense {
  id: string;
  currency: string;
  amount: number;
  spent_at: Date;
  merchant: string;
  foreign_currency: string;
  foreign_amount: number;
  purpose: string;
  state: string;
  seq_num: string;
  no_of_files: number;
  category_display_name: string;
}
