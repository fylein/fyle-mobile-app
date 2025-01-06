import { PlatformPersonalCardQueryParams } from './platform-personal-card-query-params.model';

export interface PlatformPersonalCardFilterParams {
  pageNumber: number;
  searchString: string;
  queryParams: Partial<PlatformPersonalCardQueryParams>;
}
