import { UserDetails } from './v1/user-details.model';

export interface TaxGroup {
   id?: String;
   name: String;
   percentage: number;
   created_at?: Date;
   created_by?: UserDetails;
   updated_at?: Date;
   updated_by?: UserDetails;
   org_id?: String;
   is_enabled?: boolean;
}
