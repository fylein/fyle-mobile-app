import { UserDetails } from './v1/user-details.model';

export interface ReportV1 {
  created_at: Date;
  updated_at: Date;
  last_updated_by?: UserDetails;
  id: string;
  org_user_id?: string;
  purpose: string;
  currency: string;
  creator_id: string;
  amount: number;
  tax?: number;
  status_id?: string;
  num_transactions: number;
  tally_export_id?: string;
  state: string;
  source: string;
  reimbursement_id?: string;
  approved_at?: Date;
  reimbursed_at?: Date;
  submitted_at?: Date;
  verification_state?: string;
  trip_request_id?: string;
  exported: boolean;
  policy_flag: boolean;
  claim_number: string;
  from_dt: Date;
  to_dt: Date;
  location1: string;
  location2: string;
  location3: string;
  location4: string;
  location5: string;
  type: string;
}
