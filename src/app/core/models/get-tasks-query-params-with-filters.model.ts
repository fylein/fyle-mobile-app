import { GetTasksQueryParams } from './get-tasks.query-params.model';

export interface GetTasksQueryParamsWithFilters {
  pageNumber: number;
  queryParams: Partial<GetTasksQueryParams>;
  sortParam: string;
  sortDir: string;
  searchString: string;
}
