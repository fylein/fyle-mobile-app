import deepFreeze from 'deep-freeze-strict';

import { ReportStats } from '../models/report-stats.model';

export const expectedReportStats: ReportStats = deepFreeze({
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
    count: 45,
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
    processing_amount: 5012.12,
    processing_count: 7,
    reimbursable_amount: null,
  },
});

export const expectedEmptyReportStats: ReportStats = deepFreeze({
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
});
