import { ReportApprovals } from '../report-approvals.model';
import { ReportState } from './report.model';

export interface ExpenseReport {
  amount: number;
  approvals: ReportApprovals[];
  id: string;
  last_approved_at: Date;
  last_paid_at: Date;
  last_submitted_at: Date;
  seq_num: string;
  state: ReportState;
  last_verified_at: Date;
  reimbursement_id: string;
  reimbursement_seq_num: string;
  title: string;
}
