export interface PlatformCategoryData {
  id: number;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  sub_category: string;
  is_enabled: boolean;
  display_name: string;
  system_category: string;
  code: string;
  restricted_project_ids?: number[];
}
