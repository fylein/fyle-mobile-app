export interface PlatformProjectData {
  id: number;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  sub_project: string;
  code: string;
  display_name: string;
  description: string;
  is_enabled: boolean;
}
