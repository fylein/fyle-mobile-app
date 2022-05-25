import { DeviceInfo } from '@capacitor/device';

export interface ExtendedDeviceInfo extends DeviceInfo {
  uuid: string;
  appVersion: string;
}
