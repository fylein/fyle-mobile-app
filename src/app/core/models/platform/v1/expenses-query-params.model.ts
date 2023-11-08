import { APIQueryParams } from './query-params.model';

export interface ExpensesQueryParams extends APIQueryParams {
  report_id?: string;
  state?: string;
  searchString?: string;
  queryParams?: Record<string, string>;
}
