import { Injectable, inject } from '@angular/core';
import { filter, map, switchMap } from 'rxjs/operators';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { forkJoin, noop, of, Observable } from 'rxjs';
import { RouterApiService } from './router-api.service';
import { AppVersion } from '../models/app_version.model';
import { environment } from 'src/environments/environment';
import { ExtendedDeviceInfo } from '../models/extended-device-info.model';
import { LoginInfoService } from './login-info.service';
import { AuthService } from './auth.service';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { AppSupportedDetails } from '../models/app-supported-details.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AppVersionService {
  private platformV1ApiService = inject(SpenderPlatformV1ApiService);

  private routerApiService = inject(RouterApiService);

  private loginInfoService = inject(LoginInfoService);

  private authService = inject(AuthService);

  // not fixing since copied from somewhere
  // not human readable at the moment
  // eslint-disable-next-line complexity
  isVersionLower(version1: string, version2: string): boolean {
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

  load(deviceInfo: ExtendedDeviceInfo): void {
    const platformOS = deviceInfo.operatingSystem.toUpperCase();
    const platformVersion = deviceInfo.osVersion;
    const liveUpdateVersion = environment.LIVE_UPDATE_APP_VERSION;

    this.get(platformOS)
      .pipe(
        switchMap((response: PlatformApiResponse<AppVersion[]>) => {
          const storedVersion = response.data[0];
          const isLower = this.isVersionLower(storedVersion?.version, liveUpdateVersion);

          if (isLower) {
            const payload = {
              data: {
                version: liveUpdateVersion,
                os: {
                  name: platformOS,
                  version: platformVersion,
                },
              },
            };
            return this.post(payload);
          }
          return of(noop);
        }),
      )
      .subscribe(noop); // because this needs to happen in the background
  }

  getUserAppVersionDetails(deviceInfo: ExtendedDeviceInfo): Observable<{
    appSupportDetails: AppSupportedDetails;
    lastLoggedInVersion: string;
    eou: ExtendedOrgUser;
    deviceInfo: ExtendedDeviceInfo;
  }> {
    return forkJoin({
      appSupportDetails: this.isSupported(deviceInfo),
      lastLoggedInVersion: this.loginInfoService.getLastLoggedInVersion(),
      eou: this.authService.refreshEou(),
    }).pipe(
      filter(
        (appVersionDetails: {
          appSupportDetails: AppSupportedDetails;
          lastLoggedInVersion: string;
          eou: ExtendedOrgUser;
        }) => !appVersionDetails.appSupportDetails.supported && environment.production,
      ),
      map((appVersionDetails) => ({ ...appVersionDetails, deviceInfo })),
    );
  }

  isSupported(deviceInfo: ExtendedDeviceInfo): Observable<AppSupportedDetails> {
    const data = {
      app_version: deviceInfo.appVersion,
      device_os: deviceInfo.platform,
    };
    return this.routerApiService.post<AppSupportedDetails>('/mobileapp/check', data);
  }

  get(os: string): Observable<PlatformApiResponse<AppVersion[]>> {
    const operatingSystem = os.toUpperCase();
    const data = {
      params: {
        order: 'created_at.desc',
        'os->name': `eq.${operatingSystem}`,
        limit: 1,
      },
    };
    return this.platformV1ApiService.get<PlatformApiResponse<AppVersion[]>>(`/mobile_app/versions`, data);
  }

  post(payload: { data: Partial<AppVersion> }): Observable<PlatformApiResponse<AppVersion>> {
    return this.platformV1ApiService.post<PlatformApiResponse<AppVersion>>('/mobile_app/versions', payload);
  }
}
