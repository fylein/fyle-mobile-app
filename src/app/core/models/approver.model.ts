export interface Approver {
  full_name: string;
  email: string;
}
export interface AdvanceApprover {
  added_by: string;
  advance_request_id: string;
  approver_email: string;
  approver_id: string;
  approver_name: string;
  approver_org_id: string;
  comment: string;
  created_at: Date;
  disabled_by: string;
  id: number;
  state: string;
  updated_at: Date;
}
