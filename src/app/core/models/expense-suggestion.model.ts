export interface ExpenseSuggestion {
  id: string;
  txn_dt: Date;
  amount: number;
  currency: string;
  split_group_id: string;
  split_group_user_amount: number;
  orig_amount?: any;
  orig_currency?: any;
  purpose?: any;
  vendor?: any;
  ranking: number;
  distance: number;
}
