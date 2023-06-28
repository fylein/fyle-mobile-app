import { GetTasksQueryParams } from '../models/get-tasks.query-params.model';

export const tasksQueryParamsParams: Partial<GetTasksQueryParams> = {
  rp_approval_state: 'in.(APPROVAL_PENDING)',
  rp_state: 'in.(APPROVER_PENDING)',
  sequential_approval_turn: 'in.(true)',
};
