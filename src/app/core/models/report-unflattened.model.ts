import { Approver } from './v1/approver.model';
import { OrgUser } from './org-user.model';
import { User } from './user.model';
import { UserDetails } from './v1/user-details.model';

export interface UnflattenedReport {
  ou: OrgUser;
  rp: {
    amount: number;
    approvals?:
      | {
          [id: string]: {
            rank: number;
            state: string;
          };
        }
      | Approver[];
    approved_at: Date;
    claim_number: string;
    created_at: Date;
    updated_at?: Date;
    currency: string;
    exported: boolean;
    from_dt: Date;
    id: string;
    approval_state?: string;
    verified?: boolean;
    location1: string;
    location2: string;
    location3: string;
    location4: string;
    location5: string;
    locations: string[];
    manual_flag: boolean;
    num_transactions: number;
    org_user_id: string;
    physical_bill: boolean;
    physical_bill_at: Date;
    last_updated_by?: UserDetails;
    creator_id?: string;
    status_id?: string;
    tally_export_id?: string;
    reimbursement_id?: string;
    policy_flag: boolean;
    purpose: string;
    reimbursed_at: Date;
    risk_state: string;
    risk_state_expense_count: number;
    settlement_id: string;
    source: string;
    state: string;
    submitted_at: Date;
    tax: number;
    to_dt: Date;
    trip_request_id: string;
    type: string;
    verification_state: string;
  };
  us: User;
}
