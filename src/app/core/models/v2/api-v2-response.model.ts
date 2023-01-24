export interface ApiV2Response<T> {
  count: number;
  data: T[];
  limit: number;
  offset: number;
  url: string;
}
