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
  value?: Value[];
  aggregates?: Aggregate[];
}

export class StatsResponse {
  data: Datum[];

  url: string;

  scalar?: boolean;

  dimension_1_1?: string;

  aggregates?: string;

  approved_by?: string;

  rp_approval_state?: string[];

  rp_state?: string[];

  sequential_approval_turn?: string[];

  constructor({ data, url }: { data: Datum[]; url: string }) {
    this.data = data;
    this.url = url;
  }

  getDatum(index: number) {
    return this.data && this.data.length > 0 && this.data[index];
  }
}
