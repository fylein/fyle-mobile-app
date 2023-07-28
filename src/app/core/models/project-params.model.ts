export interface ProjectParams {
  limit: number;
  offset: number;
  orgId?: string;
  active?: boolean;
  order?: string;
  project_id?: string;
  project_active?: string;
  project_org_category_ids?: string;
  project_org_id?: string;
  project_name?: string;
  sortDirection?: string;
  sortOrder?: string;
  orgCategoryIds?: number[];
  projectIds?: number[];
  searchNameText?: string;
}
