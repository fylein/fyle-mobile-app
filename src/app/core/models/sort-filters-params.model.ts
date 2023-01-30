import { FilterQueryParams } from './filter-query-params.model';

export interface SortFiltersParams {
  pageNumber: number;
  queryParams: FilterQueryParams;
  sortParam: string;
  sortDir: string;
  searchString: string;
}
