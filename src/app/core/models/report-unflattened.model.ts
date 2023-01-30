import { OrgUser } from './org-user.model';
import { User } from './user.model';

export interface UnflattenedReport {
  ou: OrgUser;
  rp: {
    amount: number;
    approvals: any;
    approved_at: Date;
    claim_number: string;
    created_at: Date;
    updated_at?: Date;
    currency: string;
    exported: any;
    from_dt: Date;
    id: string;
    location1: any;
    location2: any;
    location3: any;
    location4: any;
    location5: any;
    locations: any[];
    manual_flag: boolean;
    num_transactions: number;
    org_user_id: string;
    physical_bill: boolean;
    physical_bill_at: Date;
    last_updated_by?: any;
    creator_id?: string;
    status_id?: string;
    tally_export_id?: string;
    reimbursement_id?: any;
    policy_flag: boolean;
    purpose: string;
    reimbursed_at: Date;
    risk_state: any;
    risk_state_expense_count: number;
    settlement_id: string;
    source: string;
    state: string;
    submitted_at: Date;
    tax: any;
    to_dt: Date;
    trip_request_id: string;
    type: string;
    verification_state: string;
  };
  us: User;
}
