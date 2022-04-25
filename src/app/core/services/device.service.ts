import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { forkJoin, of } from 'rxjs';
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
      appInfo: this.getAppInfo(),
    }).pipe(
      map(({ deviceInfo, deviceId, appInfo }) => {
        return Object.assign(deviceInfo, deviceId, {
          appVersion: appInfo.version,
        });
      })
    );
  }

  //App plugin does have a web implementation
  getAppInfo() {
    return Capacitor.getPlatform() === 'web' ? of({ version: '1.2.3' }) : App.getInfo();
  }
}
