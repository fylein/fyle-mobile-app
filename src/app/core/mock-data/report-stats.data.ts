import { ReportsStatsResponsePlatform } from '../models/platform/v1/report-stats-response.model';
import { ReportStats } from '../models/report-stats.model';

export const expectedReportStats: ReportStats = {
  draft: {
    count: 6,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
    total_amount: 93165.91,
  },
  report: {
    count: 2,
    total_amount: 5177243929.65219,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
  approved: {
    count: 56,
    total_amount: 28758273650702.816,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
  paymentPending: {
    count: 4,
    total_amount: 501602.12,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
  processing: {
    count: 7,
    total_amount: 5012.12,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
};

export const expectedEmptyReportStats: ReportStats = {
  draft: {
    total_amount: 0,
    count: 0,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
  report: {
    total_amount: 0,
    count: 0,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
  approved: {
    total_amount: 0,
    count: 0,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
  paymentPending: {
    total_amount: 0,
    count: 0,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
  processing: {
    total_amount: 0,
    count: 0,
    failed_amount: null,
    failed_count: null,
    processing_amount: null,
    processing_count: null,
    reimbursable_amount: null,
  },
};

export const expectedSentBackResponse: ReportsStatsResponsePlatform = {
  total_amount: 4500,
  count: 2,
  failed_amount: null,
  failed_count: null,
  processing_amount: null,
  processing_count: null,
  reimbursable_amount: null,
};
