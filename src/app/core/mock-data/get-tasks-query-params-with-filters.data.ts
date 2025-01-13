import deepFreeze from 'deep-freeze-strict';

import { GetTasksQueryParamsWithFilters } from '../models/get-tasks-query-params-with-filters.model';
import { PlatformPersonalCardFilterParams } from '../models/platform/platform-personal-card-filter-params.model';

export const tasksQueryParamsWithFiltersData: Partial<GetTasksQueryParamsWithFilters> = deepFreeze({
  pageNumber: 1,
  sortDir: 'asc',
  searchString: 'example',
  queryParams: {
    state: 'in.(APPROVER_PENDING)',
    q: 'example:*',
  },
});

export const tasksQueryParamsWithFiltersData2: Partial<GetTasksQueryParamsWithFilters> = deepFreeze({
  pageNumber: 1,
  sortDir: 'asc',
  searchString: 'example',
  queryParams: {
    state: 'in.(APPROVER_PENDING)',
  },
});

export const tasksQueryParamsWithFiltersData3: Partial<GetTasksQueryParamsWithFilters> = deepFreeze({
  pageNumber: 1,
  sortDir: 'desc',
  searchString: 'example',
  sortParam: 'last_submitted_at',
  queryParams: {
    state: 'in.(APPROVER_INQUIRY)',
    and: '(last_submitted_at.gte.2023-01-01T00:00:00.000Z,last_submitted_at.lt.2023-01-04T00:00:00.000Z)',
  },
});

export const personalCardQueryParamFiltersData: Partial<PlatformPersonalCardFilterParams> = deepFreeze({
  pageNumber: 1,
  queryParams: {
    or: [],
    state: 'in.(INITIALIZED)',
    personal_card_id: 'eq.baccY70V3Mz048',
  },
});
