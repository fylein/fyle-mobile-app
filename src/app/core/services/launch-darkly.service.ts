import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { AuthService } from './auth.service';
import { NetworkService } from './network.service';
import { DeviceService } from './device.service';
import { OrgService } from './org.service';

import { concat, forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

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

  shutDownClient() {
    (window as any).ldClient.off('initialized', this.onLDInitialized, this);
    (window as any).ldClient.off('change', this.onLDChange, this);

    (window as any).ldClient.close();
  }

  changeUser() {
    this.getCurrentUser().subscribe((user) => {
      if (this.isOnline) {
        console.log('Changing user to ' + JSON.stringify(user));
        (window as any).ldClient.identify(user);
      }
    });
  }

  private initializeUser() {
    this.getCurrentUser().subscribe((user) => {
      if (this.isOnline) {
        console.log('Initializing user to ' + JSON.stringify(user));

        (window as any).ldClient = LDClient.initialize(environment.LAUNCH_DARKLY_CLIENT_ID, user);

        (window as any).ldClient.on('initialized', this.onLDInitialized, this);
        (window as any).ldClient.on('change', this.onLDChange, this);
      }
    });
  }

  private onLDInitialized() {
    (window as any).addEventListener('beforeunload', this.shutDownClient);
  }

  private onLDChange() {}

  private getCurrentUser(): Observable<LDClient.LDUser> {
    const eou$ = from(this.authService.getEou());

    return eou$.pipe(
      switchMap((eou) => {
        if (eou) {
          const currentOrg$ = this.orgService.getCurrentOrg();
          const devicePlatform$ = this.getDevicePlatform();

          return forkJoin([currentOrg$, devicePlatform$]).pipe(
            switchMap(([org, platform]) => {
              // HACK ALERT - Added (currentOrg as any).created_at because created_at is typed as a date but internally is a string
              // Typescript complains when passed date to LaunchDarkly, only primitive types and arrays are accepted
              // But since created_at is a string we have to convert currentOrg to any.
              // TODO - REMOVE THIS AFTER THE ORG MODEL IS FIXED

              const user = {
                key: eou.ou.user_id,
                custom: {
                  org_id: eou.ou.org_id,
                  org_user_id: eou.ou.id,
                  org_currency: org.currency,
                  org_created_at: (org as any).created_at,
                  asset: `MOBILE - ${platform.toUpperCase()}`,
                },
              };

              return of(user);
            })
          );
        } else {
          const anonymousUser = {
            anonymous: true,
          };

          return of(anonymousUser);
        }
      })
    );
  }

  private setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).subscribe((isOnline) => {
      this.isOnline = isOnline;
      this.initializeUser();
    });
  }

  private getDevicePlatform() {
    return this.deviceService.getDeviceInfo().pipe(map((device) => device.platform));
  }
}
