import { ReportApprovals } from '../report-approvals.model';
import { Comment } from './comment.model';
import { Level } from './level.model';

export interface Report {
  id: string;
  org_id: string;
  created_at: Date | string;
  updated_at: Date;
  user_id: string;
  comments: Comment[];
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  purpose: string;
  currency: string;
  amount: number;
  tax: number;
  state: string;
  num_expenses: number;
  is_verified: boolean;
  settlement_id: string;
  is_physical_bill_submitted: boolean;
  physical_bill_submitted_at: Date;
  is_manually_flagged: boolean;
  is_policy_flagged: boolean;
  is_exported: boolean;
  last_paid_at: Date;
  last_approved_at: Date;
  last_submitted_at: Date;
  last_resubmitted_at: Date;
  seq_num: string;
  source: string;
  approvals: ReportApprovals[];
  employee_id: string;
  employee: {
    id: string;
    user_id: string;
    user: {
      id: string;
      email: string;
      full_name: string;
    };
    code: string;
    org_id: string;
    org_name: string;
    department_id: string;
    level: Level;
    mobile: string;
    department: {
      id: string;
      code: string;
      name: string;
      sub_department: string;
      display_name: string;
    };
    ach_account: {
      added: boolean;
      verified: true;
    };
    business_unit: string;
    location: string;
    title: string;
  };
  next_approver_user_ids: string[];
  state_display_name: string;
}

export enum ReportState {
  APPROVED = 'APPROVED',
  APPROVER_INQUIRY = 'APPROVER_INQUIRY',
  APPROVER_PENDING = 'APPROVER_PENDING',
  DRAFT = 'DRAFT',
  PAID = 'PAID',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
}
