import deepFreeze from 'deep-freeze-strict';

import { ReportApiParams } from '../models/report-api-params.model';

export const getMyReportsParam1: ReportApiParams = deepFreeze({
  offset: 0,
  limit: 2,
  queryParams: {
    rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
  },
  order: undefined,
});

export const getMyReportsParam2: ReportApiParams = deepFreeze({
  offset: 2,
  limit: 2,
  queryParams: {
    rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
  },
  order: undefined,
});

export const getTeamReportsParams1: ReportApiParams = deepFreeze({
  offset: 0,
  limit: 10,
  state: 'in.(APPROVER_PENDING)',
  next_approver_user_ids: 'cs.[usvKA4X8Ugcr]',
  order: null,
});

export const getTeamReportsParams2: ReportApiParams = deepFreeze({
  offset: 0,
  limit: 10,
  state: 'in.(APPROVER_PENDING)',
  next_approver_user_ids: 'cs.[usvKA4X8Ugcr]',
  order: null,
});
