import { DeviceInfo } from '@capacitor/device';

export interface ExtendedDeviceInfo extends DeviceInfo {
  identifier: string;
  appVersion: string;
  liveUpdateAppVersion: string;
}
