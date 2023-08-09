export interface ReportApprovals {
  approver_user_id: string;
  approver_user: {
    id: string;
    email: string;
    full_name: string;
  };
  state: string;
}
