import {Injectable} from '@angular/core';
import {forkJoin, from, of} from 'rxjs';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import {catchError, map, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor() { }

  getDeviceInfo() {
    return forkJoin({
      deviceInfo: from(Device.getInfo()).pipe(
          catchError(() => of(null))
      ),
      appInfo: from(App.getInfo()).pipe(
          catchError(() => of(null))
      ),
      appId: from(Device.getId()).pipe(
          catchError(() => of(null))
      )
    }).pipe(
        map(({ deviceInfo, appInfo, appId }) => ({
          uuid: appId?.uuid,
          appVersion: appInfo?.version,
          platform: deviceInfo?.platform,
          operatingSystem: deviceInfo?.operatingSystem,
          osVersion: deviceInfo?.osVersion
        }))
    );
  }
}
