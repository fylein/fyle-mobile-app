import {Injectable} from '@angular/core';
import {forkJoin, from} from 'rxjs';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import {map, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor() { }

  getDeviceInfo() {
    return forkJoin({
      deviceInfo: from(Device.getInfo()),
      appInfo: from(App.getInfo()),
      appId: from(Device.getId())
    }).pipe(
        map(({ deviceInfo, appInfo, appId }) => ({ uuid: appId.uuid, appVersion: appInfo.version, platform: deviceInfo.platform }))
    );
  }
}
