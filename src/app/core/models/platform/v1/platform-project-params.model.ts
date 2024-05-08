export interface PlatformProjectParams {
  limit: number;
  offset: number;
  order?: string;
  sortDirection?: string;
  sortOrder?: string;
  searchNameText?: string;
  active?: boolean;
  is_enabled?: string | boolean;
  id?: string;
  category_ids?: string;
  org_id?: string;
  name?: string;
  orgCategoryIds?: string[];
  projectIds?: number[];
}
