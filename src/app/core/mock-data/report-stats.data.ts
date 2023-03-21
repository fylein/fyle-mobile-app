import { ReportStats } from '../models/report-stats.model';

export const expectedReportStats: ReportStats = {
  draft: {
    count: 6,
    sum: 93165.91,
  },
  report: {
    count: 45,
    sum: 5177243929.65219,
  },
  approved: {
    count: 56,
    sum: 28758273650702.816,
  },
  paymentPending: {
    count: 4,
    sum: 501602.12,
  },
  processing: {
    count: 7,
    sum: 5012.12,
  },
};

export const expectedEmptyReportStats: ReportStats = {
  draft: {
    sum: 0,
    count: 0,
  },
  report: {
    sum: 0,
    count: 0,
  },
  approved: {
    sum: 0,
    count: 0,
  },
  paymentPending: {
    sum: 0,
    count: 0,
  },
  processing: {
    sum: 0,
    count: 0,
  },
};
