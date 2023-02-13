export interface ReportParams {
  state?: string[];
  or?: string;
  order_by?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}
