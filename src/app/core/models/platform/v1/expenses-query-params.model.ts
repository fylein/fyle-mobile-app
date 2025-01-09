import { APIQueryParams } from './query-params.model';

export interface ExpensesQueryParams extends APIQueryParams {
  report_id?: string;
  state?: string;
  split_group_id?: string;
  searchString?: string;
  queryParams?: Record<string, string | string[] | boolean>;
}
