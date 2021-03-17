export interface UserProperty {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  devices?: { id: string; fcm_token: string; }[];
}
