import { DataFeedSource } from '../../enums/data-feed-source.enum';

export interface PlatformCorporateCard {
  assignor_user_id: string;
  bank_name: string;
  card_number: string;
  cardholder_name: string;
  code: string;
  created_at: string;
  data_feed_source: DataFeedSource;
  id: string;
  is_dummy: boolean;
  is_mastercard_enrolled: boolean;
  is_visa_enrolled: boolean;
  last_assigned_at: string;
  last_ready_for_verification_at: string;
  last_synced_at: string;
  last_verification_attempt_at: string;
  last_verified_at: string;
  org_id: string;
  updated_at: string;
  user_id: string;
  verification_status: string;
}
