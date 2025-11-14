export interface DwollaCustomerPlatform {
  id: string;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  customer_id: string;
  customer_email: string;
  customer_added_by: string;
  is_customer_verified: boolean;
  is_beneficial_owner_added: boolean;
  is_beneficial_owner_verified: boolean;
  is_bank_account_added: boolean;
  is_bank_account_verified: boolean;
  bank_account_added_by: string;
  is_customer_document_needed: boolean;
  is_beneficial_owner_document_needed: boolean;
  is_customer_retry: boolean;
  is_customer_suspended: boolean;
  micro_deposit_verification_status: string;
  micro_deposit_verification_attempts: number;
  is_beneficial_owner_retry: boolean;
}
