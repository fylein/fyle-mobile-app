export interface ReportsQueryParams {
  state?: string;
  offset?: number;
  limit?: number;
  order?: string;
}

export interface CreateDraftParams {
  data: {
    purpose: string;
    source: string;
  };
}
