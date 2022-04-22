import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor() {}

  getDeviceInfo() {
    return forkJoin({
      deviceInfo: Device.getInfo(),
      deviceId: Device.getId(),
      appInfo: App.getInfo(),
    }).pipe(
      map(({ deviceInfo, deviceId, appInfo }) => {
        return Object.assign(deviceInfo, deviceId, {
          appVersion: appInfo.version,
        });
      })
    );
  }
}
