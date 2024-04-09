import { GetTasksQueryParamsWithFilters } from '../models/get-tasks-query-params-with-filters.model';

export const tasksQueryParamsWithFiltersData: Partial<GetTasksQueryParamsWithFilters> = {
  pageNumber: 1,
  sortDir: 'asc',
  searchString: 'example',
  queryParams: {
    rp_state: 'in.(APPROVER_PENDING)',
  },
};

export const tasksQueryParamsWithFiltersData2: Partial<GetTasksQueryParamsWithFilters> = {
  pageNumber: 1,
  sortDir: 'asc',
  sortParam: 'approvalDate',
};

export const tasksQueryParamsWithFiltersData3: Partial<GetTasksQueryParamsWithFilters> = {
  pageNumber: 1,
  sortDir: 'desc',
  searchString: 'example',
  sortParam: 'rp_submitted_at',
  queryParams: {
    or: ['(rp_state.in.(APPROVER_INQUIRY))'],
    and: '(rp_submitted_at.gte.2023-01-01T00:00:00.000Z,rp_submitted_at.lt.2023-01-04T00:00:00.000Z)',
  },
};

export const personalCardQueryParamFiltersData = {
  pageNumber: 1,
  queryParams: {
    or: [],
    btxn_status: 'in.(DEBIT)',
    ba_id: 'eq.baccLesaRlyvLY',
  },
};
