import deepFreeze from 'deep-freeze-strict';

import { ReportStatsData } from '../models/report-stats-data.model';
import { expectedReportStats } from './report-stats.data';

export const reportStatsData1: ReportStatsData = deepFreeze({
  reportStats: expectedReportStats,
  simplifyReportsSettings: { enabled: true },
  homeCurrency: 'INR',
  currencySymbol: '₹',
  isNonReimbursableOrg: false,
});

export const reportStatsData2: ReportStatsData = deepFreeze({
  ...reportStatsData1,
  simplifyReportsSettings: { enabled: undefined },
});
