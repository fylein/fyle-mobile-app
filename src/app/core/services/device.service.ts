import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { App, AppInfo } from '@capacitor/app';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtendedDeviceInfo } from '../models/extended-device-info.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor() {}

  getDeviceInfo(): Observable<ExtendedDeviceInfo> {
    return forkJoin({
      deviceInfo: Device.getInfo(),
      deviceId: Device.getId(),
      appInfo: this.getAppInfo(),
    }).pipe(
      map(({ deviceInfo, deviceId, appInfo }) =>
        Object.assign(deviceInfo, deviceId, {
          appVersion: appInfo.version,
          liveUpdateAppVersion: environment.LIVE_UPDATE_APP_VERSION,
        }),
      ),
    );
  }

  //App plugin does not have a web implementation
  getAppInfo(): Promise<AppInfo> | Observable<{ version: string }> {
    return Capacitor.getPlatform() === 'web' ? of({ version: '1.2.3' }) : App.getInfo();
  }
}
