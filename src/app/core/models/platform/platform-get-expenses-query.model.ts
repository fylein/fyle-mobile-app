export interface PlatformGetExpenseQueryParam {
  pageNumber: number;
  sortParam: string;
  sortDir: string;
  searchString: string;
  queryParams: Record<string, string | string[] | boolean>;
}
