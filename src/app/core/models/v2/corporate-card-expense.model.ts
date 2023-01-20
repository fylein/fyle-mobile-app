import { TxnDetail } from './txn-detail.model';

export interface CorporateCardExpense {
  amount: number;
  balance_transfer_id: string;
  balance_transfer_settlement_id: string;
  bank_txn_id: string;
  corporate_credit_card_account_number: string;
  created_at: Date | string;
  creator_id: string;
  currency: string;
  description: string;
  group_id: string;
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
  txn_dt: Date | string;
  updated_at: Date | string;
  us_email: string;
  us_full_name: string;
  vendor: string;
}
