export interface ApiV2Response<T> {
  count: number;
  limit?: number;
  offset: number;
  data: T[];
  url?: string;
}
