import { PlatformMerchant } from './platform/platform-merchants.model';

export interface Vendor {
  id: number;
  tin: string;
  cin: string;
  display_name: string;
  other_names: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
  verified: boolean;
}

export interface VendorListItem {
  label: string;
  value: PlatformMerchant;
  selected?: boolean;
  isRecentlyUsed?: boolean;
}
