import { ReportApiParams } from '../models/report-api-params.model';

export const getMyReportsParam1: ReportApiParams = {
  offset: 0,
  limit: 2,
  queryParams: {
    rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
  },
  order: undefined,
};

export const getMyReportsParam2: ReportApiParams = {
  offset: 2,
  limit: 2,
  queryParams: {
    rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
  },
  order: undefined,
};
