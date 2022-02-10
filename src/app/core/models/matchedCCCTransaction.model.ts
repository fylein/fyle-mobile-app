export interface MatchedCCCTransaction {
  amount: number;
  balance_transfer_id: number;
  card_or_account_number: string;
  created_at: Date;
  creator_id: number;
  currency: string;
  description: string;
  group_id: string;
  id: string;
  orig_amount: number;
  orig_currency: string;
  payment_id: string;
  settlement_id: string;
  state: string;
  txn_dt: Date;
  updated_at: Date;
  vendor: string;
}
