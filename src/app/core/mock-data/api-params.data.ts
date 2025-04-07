import deepFreeze from 'deep-freeze-strict';

import { ReportApiParams } from '../models/report-api-params.model';

export const getTeamReportsParams1: ReportApiParams = deepFreeze({
  offset: 0,
  limit: 10,
  state: 'in.(APPROVER_PENDING)',
  next_approver_user_ids: 'cs.[usvKA4X8Ugcr]',
  order: 'created_at.desc,id.desc',
});

export const getTeamReportsParams2: ReportApiParams = deepFreeze({
  offset: 0,
  limit: 10,
  state: 'in.(APPROVER_PENDING)',
  next_approver_user_ids: 'cs.[usvKA4X8Ugcr]',
  order: 'created_at.desc,id.desc',
});
