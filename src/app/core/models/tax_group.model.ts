import { UserDetails } from './v1/user-details.model';

export interface TaxGroup {
  id?: string;
  name: string;
  percentage: number;
  created_at?: Date;
  created_by?: UserDetails;
  updated_at?: Date;
  updated_by?: UserDetails;
  org_id?: string;
  is_enabled?: boolean;
}
