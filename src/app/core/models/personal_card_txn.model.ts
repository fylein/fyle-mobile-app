export interface PersonalCardTxn {
  ba_account_number: string;
  ba_bank_name: string;
  ba_id: string;
  ba_nickname: string;
  btxn_amount: number;
  btxn_created_at: any;
  btxn_currency: string;
  btxn_description: string;
  btxn_external_id: string;
  btxn_id: string;
  btxn_orig_amount: string;
  btxn_orig_currency: string;
  btxn_status: string;
  btxn_transaction_type: string;
  btxn_vendor: string;
  tx_split_group_id: string;
}
