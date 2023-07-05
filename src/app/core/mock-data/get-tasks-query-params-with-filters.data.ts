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
