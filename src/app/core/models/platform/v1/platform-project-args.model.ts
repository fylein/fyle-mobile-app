export interface PlatformProjectArgs {
  orgId?: string;
  isEnabled?: boolean;
  orgCategoryIds?: string[];
  searchNameText?: string;
  limit?: number;
  offset?: number;
  sortOrder?: string;
  sortDirection?: string;
  projectIds?: number[];
}
