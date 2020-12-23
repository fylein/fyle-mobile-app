import {TxnDetail} from './txn-detail.model';

export interface CorporateCardExpense {
  amount: number;
  balance_transfer_id?: any;
  balance_transfer_settlement_id?: any;
  bank_txn_id: string;
  corporate_credit_card_account_number: string;
  created_at: Date;
  creator_id?: any;
  currency: string;
  description?: any;
  group_id: string;
  id: string;
  ignored: boolean;
  matched_at: Date;
  matched_by: string;
  orig_amount?: any;
  orig_currency?: any;
  ou_department_id?: any;
  ou_id: string;
  ou_org_id: string;
  payment_id: string;
  personal: boolean;
  reversed: boolean;
  settlement_id?: any;
  state: string;
  tx_split_group_id: string;
  txn_details: TxnDetail[];
  txn_dt: Date;
  updated_at: Date;
  us_email: string;
  us_full_name: string;
  vendor: string;
}



