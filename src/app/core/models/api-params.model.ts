export interface ApiParams {
  offset?: number;
  limit?: number;
  queryParams: {
    rp_state?: string;
    or?: string | string[];
    rp_id?: string;
  };
  order?: string;
}
