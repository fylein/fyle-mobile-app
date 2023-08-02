import { FilterQueryParams } from './filter-query-params.model';

export type GetExpensesQueryParamsWithFilters = {
  pageNumber: number;
  queryParams: FilterQueryParams;
  sortParam: string;
  sortDir: string;
  searchString: string;
};
