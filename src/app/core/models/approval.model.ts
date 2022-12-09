export interface Approval {
  id: number;
  created_at?: any;
  updated_at?: any;
  approver_id: string;
  state: string;
  added_by: string;
  disabled_by?: any;
  approver_name: string;
  approver_email: string;
  comment?: any;
}
