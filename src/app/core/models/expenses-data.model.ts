import { ExpensesQueryParams } from './expenses-query-params.model';

export type ExpensesData = {
  pageNumber: number;
  queryParams: Partial<ExpensesQueryParams>;
  sortParam: string;
  sortDir: string;
  searchString: string;
};
