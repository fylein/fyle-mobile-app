import { Injectable } from '@angular/core';
import { filter, map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { forkJoin, noop, of, from } from 'rxjs';
import { RouterApiService } from './router-api.service';
import { AppVersion } from '../models/app_version.model';
import { environment } from 'src/environments/environment';
import { ExtendedDeviceInfo } from '../models/extended-device-info.model';
import { LoginInfoService } from './login-info.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppVersionService {
  constructor(
    private apiService: ApiService,
    private routerApiService: RouterApiService,
    private loginInfoService: LoginInfoService,
    private authService: AuthService
  ) {}

  // not fixing since copied from somewhere
  // not human readable at the moment
  // eslint-disable-next-line complexity
  isVersionLower(version1, version2) {
    // https://gist.github.com/alexey-bass/1115557#file-compare-js
    // someone should shoot this person for writing this
    // TODO: Cleanup
    if (typeof version1 + typeof version2 !== 'stringstring') {
      return true;
    }

    const a = version1.split('.');
    const b = version2.split('.');
    const len = Math.max(a.length, b.length);

    for (let i = 0; i < len; i++) {
      if ((a[i] && !b[i] && parseInt(a[i], 10) > 0) || parseInt(a[i], 10) > parseInt(b[i], 10)) {
        return false;
      } else if ((b[i] && !a[i] && parseInt(b[i], 10) > 0) || parseInt(a[i], 10) < parseInt(b[i], 10)) {
        return true;
      }
    }

    return false;
  }

  load(deviceInfo: ExtendedDeviceInfo) {
    const platformOS = deviceInfo.operatingSystem;
    const platformVersion = deviceInfo.osVersion;
    const liveUpdateVersion = environment.LIVE_UPDATE_APP_VERSION;

    this.get(platformOS)
      .pipe(
        switchMap((storedVersion) => {
          const isLower = this.isVersionLower(storedVersion?.app_version, liveUpdateVersion);

          if (isLower) {
            const data = {
              app_version: liveUpdateVersion,
              device_platform: platformOS,
              platform_version: platformVersion,
            };
            return this.post(data);
          }
          return of(noop);
        })
      )
      .subscribe(noop); // because this needs to happen in the background
  }

  getUserAppVersionDetails(deviceInfo: ExtendedDeviceInfo) {
    return forkJoin({
      appSupportDetails: this.isSupported(deviceInfo),
      lastLoggedInVersion: this.loginInfoService.getLastLoggedInVersion(),
      eou: from(this.authService.getEou()),
    }).pipe(
      filter((res) => !res.appSupportDetails.supported && environment.production),
      map((res) => ({ ...res, deviceInfo }))
    );
  }

  isSupported(deviceInfo: ExtendedDeviceInfo) {
    const data = {
      app_version: deviceInfo.appVersion,
      device_os: deviceInfo.platform,
    };
    return this.routerApiService.post('/mobileapp/check', data);
  }

  get(os: string) {
    const operatingSystem = os.toUpperCase();
    return this.apiService.get(`/version/app/${operatingSystem}`).pipe(map((res) => res as AppVersion));
  }

  post(data) {
    return this.apiService.post('/version/app', data);
  }
}
