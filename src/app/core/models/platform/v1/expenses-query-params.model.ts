import { APIQueryParams } from './query-params.model';

export interface ExpensesQueryParams extends APIQueryParams {
  report_id?: string;
  queryParams?: Record<string, string | string[] | boolean>;
}
