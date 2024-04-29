export interface PlatformProject {
  id: number;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  sub_project: string | null;
  code: string | null;
  display_name: string;
  description: string;
  is_enabled: boolean;
  category_ids: number[] | null;
}
