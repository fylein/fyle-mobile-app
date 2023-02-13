import { ApiParams } from '../models/api-params.model';

export const getMyReportsParam1: ApiParams = {
  offset: 0,
  limit: 2,
  queryParams: {
    rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
  },
  order: undefined,
};

export const getMyReportsParam2: ApiParams = {
  offset: 2,
  limit: 2,
  queryParams: {
    rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
  },
  order: undefined,
};
