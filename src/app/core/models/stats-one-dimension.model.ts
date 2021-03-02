export class StatsOneDResponse {

  constructor (obj: any) {
    this.dimensions = obj.dimensions;
    this.value = obj.value;
    this.name = obj.name;
  }

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
  getStatAggregatesByIdx<T>(index: number): Array<{value: T; key: string}> {
    return this.value.map(stat =>  {
      return {
        value: stat.aggregates.length && stat.aggregates[index].function_value,
        key: stat.key.length && stat.key[index].column_value  
      }
    });
  }

  public static getStatsCountBySource(stats: {value: number; key: string}[], source: string) {
    const filteresStatsRes = stats.filter(stat => stat.key.toLowerCase().indexOf(source.toLowerCase()) > -1);
    return filteresStatsRes.reduce((acc, statValue) => acc + statValue.value, 0);
  }
}
