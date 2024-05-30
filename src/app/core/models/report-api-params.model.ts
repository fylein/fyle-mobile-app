export interface ReportQueryParams {
  rp_state?: string;
  or?: string | string[];
  rp_id?: string;
}

export interface ReportApiParams {
  offset?: number;
  limit?: number;
  state?: string;
  order?: string;
}
