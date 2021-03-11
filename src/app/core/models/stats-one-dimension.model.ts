export class StatsOneDResponse {

  constructor (statObj: any) {
    this.dimensions = statObj.dimensions;
    this.name = statObj.name;
    this.value = statObj.value;
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
  getStatsTotalCount(index = 0): number {
    const stats = this.getStatAggregatesByIdx<number>(index);
    return stats.reduce((acc, statValue) => acc + statValue.value, 0);
  }

  public getStatsCountBySource(source: string, index = 0) {
    const stats = this.getStatAggregatesByIdx<number>(index);
    const filteresStatsRes = stats.filter(stat => stat.key.toLowerCase().indexOf(source.toLowerCase()) > -1);
    return filteresStatsRes.reduce((acc, statValue) => acc + statValue.value, 0);
  }
}
