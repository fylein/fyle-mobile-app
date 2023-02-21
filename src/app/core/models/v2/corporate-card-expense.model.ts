import { TxnDetail } from './txn-detail.model';

export interface CorporateCardExpense {
  _search_document?: string;
  amount: number;
  balance_transfer_id: string;
  balance_transfer_settlement_id: string;
  bank_txn_id: string;
  corporate_credit_card_account_number: string;
  created_at: Date;
  creator_id: string;
  currency: string;
  description: string;
  group_id: string;
  group_amount?: number;
  id: string;
  ignored: boolean;
  matched_at: Date;
  matched_by: string;
  orig_amount: number;
  orig_currency: string;
  ou_department_id: string;
  ou_id: string;
  ou_org_id: string;
  payment_id: string;
  personal: boolean;
  reversed: boolean;
  settlement_id: string;
  state: string;
  tx_split_group_id: string;
  txn_details: TxnDetail[];
  txn_dt: Date;
  transaction_type?: string;
  updated_at: Date;
  us_email: string;
  us_full_name: string;
  vendor: string;
}
