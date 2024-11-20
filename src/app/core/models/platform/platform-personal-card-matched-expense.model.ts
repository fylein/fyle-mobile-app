export interface PlatformPersonalCardMatchedExpense {
  id: string;
  currency: string;
  amount: number;
  spent_at: string;
  merchant: string;
  foreign_currency: string | null;
  foreign_amount: number | null;
  purpose: string;
  state: string;
  seq_num: string;
  no_of_files: number;
  category_display_name: string;
}
