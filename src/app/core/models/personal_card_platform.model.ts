export interface PersonalCardPlatform {
  account_type: string;
  bank_name: string;
  card_number: string;
  created_at: Date;
  currency: string;
  id: string;
  org_id: string;
  updated_at: Date;
  user_id: string;
  yodlee_account_id: string;
  yodlee_fastlink_params?: string;
  yodlee_is_credential_update_required: boolean;
  yodlee_is_mfa_required: boolean;
  yodlee_last_synced_at: Date | null;
  yodlee_login_id: string;
  yodlee_provider_account_id: string;
}
