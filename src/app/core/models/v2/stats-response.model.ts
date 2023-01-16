export interface Aggregate {
  function_name: string;
  function_value: number;
}

export interface Key {
  column_name: string;
  column_value: string;
}

export interface Value {
  aggregates: Aggregate[];
  key: Key[];
}

export interface Datum {
  dimensions: string[];
  name: string;
  value: Value[];
}

export class StatsResponse {
  data: Datum[];

  url: string;

  constructor({ data, url }) {
    this.data = data;
    this.url = url;
  }

  getDatum?(index: number) {
    return this.data && this.data.length > 0 && this.data[index];
  }
}
