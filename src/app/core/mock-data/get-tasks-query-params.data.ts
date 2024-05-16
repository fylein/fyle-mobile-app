import deepFreeze from 'deep-freeze-strict';

import { GetTasksQueryParams } from '../models/get-tasks.query-params.model';

export const tasksQueryParamsParams: Partial<GetTasksQueryParams> = deepFreeze({
  state: 'in.(APPROVER_PENDING)',
  next_approver_user_ids: 'cs.[usaTtklUXVZn]',
});

export const teamReportsQueryParams: Partial<GetTasksQueryParams> = deepFreeze({
  or: [],
  and: '(rp_submitted_at.gte.2023-01-01T00:00:00.000Z,rp_submitted_at.lt.2023-01-04T00:00:00.000Z)',
});

export const teamReportsQueryParams2: Partial<GetTasksQueryParams> = deepFreeze({
  or: [],
  and: '(rp_submitted_at.gte.2023-01-01T00:00:00.000Z)',
});

export const teamReportsQueryParams3: Partial<GetTasksQueryParams> = deepFreeze({
  or: [],
  and: '(rp_submitted_at.lt.2023-01-04T00:00:00.000Z)',
});
