import { UserDetails } from '../models/v1/user-details.model';

export interface ReportUnflattenedData {
  created_at: Date;
  updated_at: Date;
  last_updated_by?: UserDetails;
  id: string;
  org_user_id?: string;
  purpose: string;
  currency: string;
  creator_id: string;
  amount: number;
  tax?: any;
  status_id?: string;
  num_transactions: number;
  tally_export_id?: string;
  state: string;
  source: string;
  reimbursement_id?: string;
  approved_at?: Date;
  reimbursed_at?: Date;
  submitted_at?: Date;
  settlement_id?: string;
  verification_state?: string;
  trip_request_id?: string;
  physical_bill: boolean;
  exported: any;
  manual_flag: boolean;
  policy_flag: boolean;
  claim_number: string;
  physical_bill_at: Date;
  from_dt: Date;
  to_dt: Date;
  location1: string;
  location2: string;
  location3: string;
  location4: string;
  location5: string;
  type: string;
}
