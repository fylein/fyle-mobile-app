export interface BankAccountsAssigned {
  assigned_by_ou_id: string;
  assigned_to_ou_id: string;
  assignee_email: string;
  assignee_full_name: string;
  ba_account_number: string;
  ba_bank_name: string;
  ba_created_at: Date;
  ba_currency: string;
  ba_id: string;
  ba_last_synced_at: Date;
  ba_mask: string;
  ba_nickname: string;
  ba_sync_type: string;
  ba_updated_at: Date;
  total_unclassified_amount: number;
  total_unclassified_count: number;
  unclassified_credit_amount: number;
  unclassified_credit_count: number;
  unclassified_debit_amount: number;
  unclassified_debit_count: number;
  total_classified_count: number;
  total_classified_amount: number;
}
