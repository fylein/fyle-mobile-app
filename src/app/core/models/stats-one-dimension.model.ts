export interface StatsOneDResponse {
  dimensions: string[];
  name: string;
  value: [{
    aggregates: [{
      function_name: string;
      function_value: any
    }],
    key: [{
      column_name: string;
      column_value: any;
    }]
  }];
}
