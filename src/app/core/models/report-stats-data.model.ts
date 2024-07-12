import { ReportStats } from './report-stats.model';

export interface ReportStatsData {
  reportStats: ReportStats;
  homeCurrency: string;
  currencySymbol: string;
  isNonReimbursableOrg: boolean;
}
