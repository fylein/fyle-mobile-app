import { Stats } from './stats.model';

export interface ReportStats {
  draft: Stats;
  report: Stats;
  approved: Stats;
  paymentPending: Stats;
}
