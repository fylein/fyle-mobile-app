import { ReportStatsData } from '../models/report-stats-data.model';
import { expectedReportStats } from './report-stats.data';

export const reportStatsData1: ReportStatsData = {
  reportStats: expectedReportStats,
  simplifyReportsSettings: { enabled: true },
  homeCurrency: 'INR',
  currencySymbol: '₹',
  isNonReimbursableOrg: false,
};

export const reportStatsData2: ReportStatsData = {
  ...reportStatsData1,
  simplifyReportsSettings: { enabled: undefined },
};
