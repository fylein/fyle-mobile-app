import { GetExpensesQueryParams } from './get-expenses-query-params.model';

export type GetExpensesQueryParamsWithFilters = {
  pageNumber: number;
  queryParams: Partial<GetExpensesQueryParams>;
  sortParam: string;
  sortDir: string;
  searchString: string;
};
