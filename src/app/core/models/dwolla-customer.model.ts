export interface DwollaCustomer {
  email?: string;
  id: string;
  created_at: Date;
  updated_at: Date;
  customer_id: string;
  customer_email: string;
  customer_added_by: string;
  customer_verified: boolean;
  beneficial_owner_added: boolean;
  beneficial_owner_verified: boolean;
  bank_account_added: boolean;
  bank_account_verified: boolean;
  bank_account_added_by: string;
  customer_document_needed: boolean;
  beneficial_owner_document_needed: boolean;
  customer_retry: boolean;
  customer_suspended: boolean;
  micro_deposit_verification_status: string;
  micro_deposit_verification_attempts: number;
  beneficial_owner_retry: boolean;
}

