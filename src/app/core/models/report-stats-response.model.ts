export interface ReportStatsResponse {
  aggregates: {
    function_name: string;
    function_value: number;
  }[];
}
