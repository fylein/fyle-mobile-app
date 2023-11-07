import { PlatformAPIQueryParams } from './query-params.model';

export interface ExpensesQueryParams extends PlatformAPIQueryParams {
  report_id: string;
}
