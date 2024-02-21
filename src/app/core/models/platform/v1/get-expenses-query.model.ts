export interface GetExpenseQueryParam {
  pageNumber: number;
  sortParam: string;
  sortDir: string;
  searchString: string;
  queryParams: Record<string, string | string[] | boolean>;
}
