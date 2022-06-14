import { Injectable } from '@angular/core';
import { DeviceService } from './device.service';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { forkJoin, noop, of } from 'rxjs';
import { RouterApiService } from './router-api.service';
import { AppVersion } from '../models/app_version.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppVersionService {
  constructor(
    private deviceService: DeviceService,
    private apiService: ApiService,
    private routerApiService: RouterApiService
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

  load() {
    const deviceInfo$ = this.deviceService.getDeviceInfo().pipe(shareReplay(1));
    const platformOS$ = deviceInfo$.pipe(map((deviceInfo) => deviceInfo.operatingSystem as string));
    const platformVersion$ = deviceInfo$.pipe(map((deviceInfo) => deviceInfo.osVersion));

    const liveUpdateVersion = environment.LIVEUPDATE_APP_VERSION;
    const currentVersion$ = deviceInfo$.pipe(map((deviceInfo) => deviceInfo.appVersion));

    const storedVersion$ = platformOS$.pipe(switchMap((os) => this.get(os)));

    //TODO: Remove currentVersion$ as it is no longer used
    forkJoin([platformOS$, platformVersion$, currentVersion$, storedVersion$])
      .pipe(
        switchMap((aggregatedResponses) => {
          const [platformOS, platformVersion, currentVersion, storedVersion] = aggregatedResponses;
          const data = {
            app_version: liveUpdateVersion,
            device_platform: platformOS,
            platform_version: platformVersion,
          };

          const isLower = this.isVersionLower(storedVersion && storedVersion.app_version, currentVersion);

          if (isLower) {
            return this.post(data);
          } else {
            return of(noop);
          }
        })
      )
      .subscribe(noop); // because this needs to happen in the background
  }

  isSupported(data) {
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
