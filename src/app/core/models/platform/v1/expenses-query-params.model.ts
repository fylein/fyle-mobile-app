import { APIQueryParams } from './query-params.model';

export interface ExpensesQueryParams extends APIQueryParams {
  id?: string;
  report_id?: string;
  state?: string;
  searchString?: string;
  queryParams?: Record<string, string | string[] | boolean>;
}
