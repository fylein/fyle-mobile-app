import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { AuthService } from './auth.service';
import { NetworkService } from './network.service';
import { DeviceService } from './device.service';
import { OrgService } from './org.service';

import { concat, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import * as LDClient from 'launchdarkly-js-client-sdk';

@Injectable({
  providedIn: 'root',
})
export class LaunchDarklyService {
  private isOnline: boolean;

  constructor(
    private authService: AuthService,
    private orgService: OrgService,
    private networkService: NetworkService,
    private deviceService: DeviceService
  ) {
    this.setupNetworkWatcher();
  }

  async initializeLaunchDarkly() {
    const eou = await this.authService.getEou();

    if (eou && this.isOnline) {
      const currentOrg$ = this.orgService.getCurrentOrg();
      const devicePlatform$ = this.getDevicePlatform();

      forkJoin([currentOrg$, devicePlatform$]).subscribe(([currentOrg, devicePlatform]) => {
        // HACK ALERT - Added (currentOrg as any).created_at because created_at is typed as a date but internally is a string
        // Typescript complains when passed date to LaunchDarkly, only primitive types and arrays are accepted
        // But since created_at is a string we have to convert currentOrg to any.
        // TODO - REMOVE THIS AFTER THE ORG MODEL IS FIXED

        const user = {
          key: eou.ou.user_id,
          custom: {
            org_id: eou.ou.org_id,
            org_user_id: eou.ou.id,
            org_currency: currentOrg.currency,
            org_created_at: (currentOrg as any).created_at,
            asset: `MOBILE - ${devicePlatform.toUpperCase()}`,
          },
        };

        (window as any).ldclient = LDClient.initialize(environment.LAUNCH_DARKLY_CLIENT_ID, user);

        (window as any).ldclient.on('ready', () => {});
        (window as any).ldclient.on('change', () => {});
      });
    }
  }

  private setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);

    // networkWatcherEmitter will emit an event as the network status keeps changing
    concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).subscribe((isOnline) => {
      this.isOnline = isOnline;
      this.initializeLaunchDarkly();
    });
  }

  private getDevicePlatform() {
    return this.deviceService.getDeviceInfo().pipe(map((device) => device.platform));
  }
}
