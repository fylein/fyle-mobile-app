import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { catchError, map } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor() {}

  getDeviceInfoInternal(): Observable<{
    uuid: string;
    appVersion: string;
    platform: string;
    operatingSystem: string;
    osVersion: string;
  }> {
    return forkJoin({
      deviceInfo: from(Device.getInfo()).pipe(catchError(() => of(null))),
      appInfo: from(App.getInfo()).pipe(catchError(() => of(null))),
      appId: from(Device.getId()).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ deviceInfo, appInfo, appId }) => ({
        uuid: appId?.uuid,
        appVersion: appInfo?.version,
        platform: deviceInfo?.platform,
        operatingSystem: deviceInfo?.operatingSystem,
        osVersion: deviceInfo?.osVersion,
      }))
    );
  }

  getDeviceInfo(): Observable<{
    uuid: string;
    appVersion: string;
    platform: string;
    operatingSystem: string;
    osVersion: string;
  }> {
    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
      return this.getDeviceInfoInternal();
    }

    return of(null);
  }
}
