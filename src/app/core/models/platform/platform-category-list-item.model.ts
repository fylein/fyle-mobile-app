import { PlatformCategory } from './platform-category.model';

export interface PlatformCategoryListItem {
  label: string;
  value: PlatformCategory;
  selected?: boolean;
}
