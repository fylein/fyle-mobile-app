import { ReportsStatsResponsePlatform } from './platform/v1/report-stats-response.model';
import { StatsResponse } from './platform/v1/stats-response.model';

export interface ReportStats {
  draft: ReportsStatsResponsePlatform;
  report: ReportsStatsResponsePlatform;
  approved: ReportsStatsResponsePlatform;
  paymentPending: ReportsStatsResponsePlatform;
  processing: ReportsStatsResponsePlatform;
}
