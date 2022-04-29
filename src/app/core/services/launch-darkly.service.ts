import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { AuthService } from './auth.service';
import { OfflineService } from './offline.service';
import { NetworkService } from './network.service';

import { concat } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import * as LDClient from 'launchdarkly-js-client-sdk';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root',
})
export class LaunchDarklyService {
  private isOnline: boolean;

  constructor(
    private authService: AuthService,
    private offlineService: OfflineService,
    private networkService: NetworkService,
    private deviceService: DeviceService
  ) {
    this.setupNetworkWatcher();
  }

  private setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);

    concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable())
      .pipe(shareReplay(1))
      .subscribe((isOnline) => {
        this.isOnline = isOnline;
        this.initializeLaunchDarkly();
      });
  }

  private getCurrentOrg() {
    return this.offlineService.getCurrentOrg().toPromise();
  }

  private getDevicePlatform() {
    return this.deviceService
      .getDeviceInfo()
      .pipe(map((device) => device.platform))
      .toPromise();
  }

  async initializeLaunchDarkly() {
    const eou = await this.authService.getEou();

    if (eou && this.isOnline) {
      const currentOrg = await this.getCurrentOrg();
      const platform = await this.getDevicePlatform();

      if (currentOrg) {
        const user = {
          key: eou.ou.user_id,
          custom: {
            org_id: eou.ou.org_id,
            org_user_id: eou.ou.id,
            org_currency: currentOrg.currency,
            org_created_at: currentOrg.created_at,
            asset: `MOBILE - ${platform.toUpperCase()}`,
          },
        };

        (window as any).ldclient = LDClient.initialize(environment.LAUNCH_DARKLY_CLIENT_ID, user);

        (window as any).ldclient.on('ready', () => {});
        (window as any).ldclient.on('change', () => {});
      }
    }
  }
}
