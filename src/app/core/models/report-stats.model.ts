import { PlatformReportsStatsResponse } from './platform/v1/report-stats-response.model';
export interface ReportStats {
  draft: PlatformReportsStatsResponse;
  report: PlatformReportsStatsResponse;
  approved: PlatformReportsStatsResponse;
  paymentPending: PlatformReportsStatsResponse;
  processing: PlatformReportsStatsResponse;
}
