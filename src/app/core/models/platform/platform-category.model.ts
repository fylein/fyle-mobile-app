import { PlatformCategoryData } from '../../models/platform/platform-category-data.model';

export interface PlatformCategory {
  count: number;
  offset: number;
  data: PlatformCategoryData[];
}
