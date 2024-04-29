import { StatsResponse } from './platform/v1/stats-response.model';

export interface ReportStats {
  draft: StatsResponse;
  report: StatsResponse;
  approved: StatsResponse;
  paymentPending: StatsResponse;
  processing: StatsResponse;
}
