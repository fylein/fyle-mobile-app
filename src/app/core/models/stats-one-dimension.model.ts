export class StatsOneDResponse {
  dimensions: string[];
  name: string;
  value: [{
    aggregates?: [{
      function_name?: string;
      function_value?: any
    }],
    key?: [{
      column_name?: string;
      column_value?: any;
    }]
  }];
  getStatAggregatesByIdx(index: number) {
    return this.value.map(stat =>  {
      return {
        value: stat.aggregates.length && stat.aggregates[index].function_value,
        key: stat.key.length && stat.key[index].column_value  
      }
    });
  }
}
