import { Stats } from './dashboard-stats.model';

export interface ReportStats {
  draft: Stats;
  report: Stats;
  approved: Stats;
  paymentPending: Stats;
}
