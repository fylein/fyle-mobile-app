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

export const getTeamReportsParams1: ReportApiParams = {
  offset: 0,
  limit: 10,
  queryParams: {
    rp_state: 'in.(APPROVER_PENDING)',
  },
  order: null,
};

export const getTeamReportsParams2: ReportApiParams = {
  offset: 0,
  limit: 10,
  queryParams: {
    rp_state: 'in.(APPROVER_PENDING)',
  },
  order: 'approvalDate.asc',
};
