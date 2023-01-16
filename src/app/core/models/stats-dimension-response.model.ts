export interface StatsDResponse {
  aggregates: {
    function_name: string;
    function_value: number;
  }[];
  dimensions: any;
  name: string;
  scalar?: boolean;
  tx_state?: string;
  or?: string;
  tx_report_id?: string;
}
