import { DeviceInfo, DeviceId } from '@capacitor/device';

export interface ExtendedDeviceInfo extends DeviceInfo, DeviceId {
  appVersion: string;
  liveUpdateAppVersion: string;
}
