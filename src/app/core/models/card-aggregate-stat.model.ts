export interface CardAggregateStat {
  aggregates: { function_name: string; function_value: number }[];
  key: { column_name: string; column_value: string }[];
}
