export interface PlatformApiResponse<T> {
  count: number;
  offset: number;
  data: T[];
}
