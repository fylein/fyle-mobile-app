export interface DeviceInfo {
  id: string;
  fcm_token: string;
}

export interface UserProperty {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  devices?: DeviceInfo[];
}
