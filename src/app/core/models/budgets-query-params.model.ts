export interface BudgetsQueryParams {
  limit?: number;
  offset?: number;
  order?: string;
  or?: string[] | string;
  q?: string;
  and?: string[] | string;
  select?: string;
  name?: string;
}
