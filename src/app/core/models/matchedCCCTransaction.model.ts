export interface MatchedCCCTransaction {
  amount: number;
  balance_transfer_id: number | string;
  card_or_account_number: string;
  created_at: string;
  creator_id: number | string;
  currency: string;
  description: string;
  group_id: string;
  id: string;
  orig_amount: number;
  orig_currency: string;
  payment_id: string;
  settlement_id: string;
  state: string;
  txn_dt: string;
  updated_at: string;
  vendor: string;
  corporate_credit_card_account_number?: string;
  displayObject?: string;
}
