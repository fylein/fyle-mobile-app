export interface ProjectParams {
  limit: number;
  offset: number;
  active?: boolean;
  order?: string;
  project_id?: string;
  project_active?: string;
  project_org_category_ids?: string;
  project_org_id?: string;
  project_name?: string;
}
