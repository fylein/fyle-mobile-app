export interface PersonalCard {
  account_number: string;
  account_type: string;
  bank_name: string;
  created_at: Date;
  currency: string;
  id: string;
  fastlink_params?: string;
  last_synced_at: Date;
  mask: string;
  mfa_enabled?: boolean;
  nickname: string;
  official_name: string;
  sync_type: string;
  update_credentials?: boolean;
  unclassified_amount: number;
  unclassified_count: number;
  updated_at: Date;
}
