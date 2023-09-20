import { TxnDetail } from './v2/txn-detail.model';

export interface PersonalCardTxn {
  _search_document?: string;
  ba_account_number: string;
  ba_bank_name: string;
  ba_id: string;
  ba_mask?: string;
  ba_nickname: string;
  btxn_amount: number;
  btxn_created_at: Date;
  btxn_currency: string;
  btxn_description: string;
  btxn_external_id: string;
  btxn_id: string;
  btxn_transaction_dt?: Date;
  btxn_orig_amount: string;
  btxn_orig_currency: string;
  btxn_status: string;
  btxn_transaction_type: string;
  btxn_updated_at?: Date;
  tx_matched_at?: string;
  btxn_vendor: string;
  txn_details?: TxnDetail[];
  tx_split_group_id: string;
}
