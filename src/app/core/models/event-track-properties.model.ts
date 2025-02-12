import { DeviceInfo } from '@capacitor/device';

export interface EventTrackProperties {
  Asset: string;
  DeviceType: string;
  deviceInfo: Partial<DeviceInfo>;
  appVersion: string;
  label: string;
  lastLoggedInVersion: string;
  user_email: string;
}
