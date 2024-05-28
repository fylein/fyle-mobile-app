import deepFreeze from 'deep-freeze-strict';

import { ReportStats } from '../models/report-stats.model';
import { PlatformReportsStatsResponse } from '../models/platform/v1/report-stats-response.model';

export const expectedReportStats: ReportStats = deepFreeze({
  draft: {
    count: 2,
    total_amount: 93165.91,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
  report: {
    count: 2,
    total_amount: 5177243929.65219,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
  approved: {
    count: 56,
    total_amount: 28758273650702.816,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
  paymentPending: {
    count: 4,
    total_amount: 501602.12,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
  processing: {
    count: 7,
    total_amount: 5012.12,
    failed_amount: null,
    failed_count: null,
    processing_amount: 5012.12,
    processing_count: 7,
    reimbursable_amount: null,
  },
});

export const expectedEmptyReportStats: ReportStats = deepFreeze({
  draft: {
    total_amount: 0,
    count: 0,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
  report: {
    total_amount: 0,
    count: 0,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
  approved: {
    total_amount: 0,
    count: 0,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
  paymentPending: {
    total_amount: 0,
    count: 0,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
  processing: {
    total_amount: 0,
    count: 0,
    failed_amount: 0,
    failed_count: 0,
    processing_amount: 0,
    processing_count: 0,
    reimbursable_amount: 0,
  },
});

export const expectedSentBackResponse: PlatformReportsStatsResponse = deepFreeze({
  total_amount: 4500,
  count: 2,
  failed_amount: 0,
  failed_count: 0,
  processing_amount: 0,
  processing_count: 0,
  reimbursable_amount: 0,
});

export const expectedSentBackResponseSingularReport: PlatformReportsStatsResponse = deepFreeze({
  total_amount: 4500,
  count: 1,
  failed_amount: 0,
  failed_count: 0,
  processing_amount: 0,
  processing_count: 0,
  reimbursable_amount: 0,
});
