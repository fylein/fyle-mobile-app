export interface StatsDResponse {
  aggregates: {
    function_name: string;
    function_value: number;
  }[];
  dimensions: any;
  name: string;
}
