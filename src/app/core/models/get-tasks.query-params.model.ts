export interface GetTasksQueryParams {
  next_approver_user_ids?: string;
  state?: string;
  created_at?: string;
  last_submitted_at?: string;
  or?: [];
  and?: string;
}
