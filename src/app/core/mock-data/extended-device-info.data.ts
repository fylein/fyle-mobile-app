import deepFreeze from 'deep-freeze-strict';

import { ExtendedDeviceInfo } from '../models/extended-device-info.model';

export const extendedDeviceInfoMockData: ExtendedDeviceInfo = deepFreeze({
  identifier: 'mockidentifier123',
  appVersion: '5.50.0',
  liveUpdateAppVersion: '5.50.0',
  model: 'iPhone 11 Pro Max',
  platform: 'ios',
  operatingSystem: 'ios',
  osVersion: '16.0.1',
  manufacturer: 'Apple',
  isVirtual: false,
  webViewVersion: 'mockwebviewversion123',
});

export const extendedDeviceInfoMockData2: ExtendedDeviceInfo = deepFreeze({
  identifier: 'mockidentifier124',
  appVersion: '5.52.0',
  liveUpdateAppVersion: '5.52.0',
  model: 'Samsung Galaxy A13',
  platform: 'android',
  operatingSystem: 'android',
  osVersion: '12.0.0',
  manufacturer: 'Samsung',
  isVirtual: false,
  webViewVersion: 'mockwebviewversion124',
});

export const extendedDeviceInfoMockDataWoApp: ExtendedDeviceInfo = deepFreeze({
  identifier: 'mockidentifier124',
  appVersion: null,
  liveUpdateAppVersion: '5.52.0',
  model: 'Samsung Galaxy A13',
  platform: 'android',
  operatingSystem: 'android',
  osVersion: '12.0.0',
  manufacturer: 'Samsung',
  isVirtual: false,
  webViewVersion: 'mockwebviewversion124',
});
