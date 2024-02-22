export interface ReportPlatformParams {
  state?: string;
}

export interface CreateDraftParams {
  data: {
    purpose: string;
    source: string;
  };
}
