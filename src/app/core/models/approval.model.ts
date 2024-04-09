export interface Approval {
  id: number;
  created_at?: Date;
  updated_at?: Date;
  approver_id: string;
  state: string;
  added_by: string;
  disabled_by?: string;
  advance_request_id?: string;
  approver_name: string;
  approver_email: string;
  approver_org_id?: string;
  comment?: string;
}
