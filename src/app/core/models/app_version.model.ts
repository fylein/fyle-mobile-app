export interface AppVersion {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  version: string;
  os: {
    name: string;
    version: string;
  };
}
