export interface ReportsQueryParams {
  state?: string;
  offset?: number;
  limit?: number;
  order?: string;
  id?: string;
  next_approver_user_ids?: string;
  q?: string;
  or?: string | string[];
  and?: string | string[];
}
