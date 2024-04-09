import { GetTasksQueryParams } from '../models/get-tasks.query-params.model';

export const tasksQueryParamsParams: Partial<GetTasksQueryParams> = {
  rp_approval_state: 'in.(APPROVAL_PENDING)',
  rp_state: 'in.(APPROVER_PENDING)',
  sequential_approval_turn: 'in.(true)',
};

export const teamReportsQueryParams: Partial<GetTasksQueryParams> = {
  or: [],
  and: '(rp_submitted_at.gte.2023-01-01T00:00:00.000Z,rp_submitted_at.lt.2023-01-04T00:00:00.000Z)',
};

export const teamReportsQueryParams2: Partial<GetTasksQueryParams> = {
  or: [],
  and: '(rp_submitted_at.gte.2023-01-01T00:00:00.000Z)',
};

export const teamReportsQueryParams3: Partial<GetTasksQueryParams> = {
  or: [],
  and: '(rp_submitted_at.lt.2023-01-04T00:00:00.000Z)',
};
