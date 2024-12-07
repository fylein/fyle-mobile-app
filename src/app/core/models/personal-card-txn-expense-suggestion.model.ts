export interface PersonalCardTxnExpenseSuggestion {
  purpose: string;
  vendor: string;
  txn_dt: Date;
  currency: string;
  amount: number;
  split_group_id: string;
}
