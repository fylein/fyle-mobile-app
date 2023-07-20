export interface CardTransactionsConfig {
  offset: number;
  queryParams: { state?: string; group_id?: string[] };
  limit: number;
  order?: string;
}
