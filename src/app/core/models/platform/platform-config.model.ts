import { Filters } from '../filters.model';

export interface PlatformConfig {
  offset: number;
  limit: number;
  queryParams?: Record<string, string | string[]>;
}
