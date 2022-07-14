export interface Approver {
  id: number;
  created_at: Date;
  updated_at: Date;
  report_id: string;
  approver_id: string;
  request_id: string;
  state: string;
  added_by: string;
  disabled_by: string;
  last_updated_by: Date;
  rank: number;
  approver_name: string;
  approver_email: string;
  comment: string;
}
