export interface Level {
  id: string;
  org_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  band: string | null;
  code: string | null;
  description: string | null;
  is_enabled: boolean;
}
