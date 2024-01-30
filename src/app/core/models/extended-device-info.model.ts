import { DeviceInfo } from '@capacitor/device';
import { DeviceId } from '@capacitor/device';
export interface ExtendedDeviceInfo extends DeviceInfo, DeviceId {
  appVersion: string;
  liveUpdateAppVersion: string;
}
