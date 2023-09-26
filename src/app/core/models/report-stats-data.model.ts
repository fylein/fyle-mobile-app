import { ReportStats } from './report-stats.model';

export interface ReportStatsData {
  reportStats: ReportStats;
  simplifyReportsSettings: { enabled: boolean };
  homeCurrency: string;
  currencySymbol: string;
  isNonReimbursableOrg: boolean;
}
