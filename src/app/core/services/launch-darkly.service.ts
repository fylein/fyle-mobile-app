import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { NetworkService } from './network.service';
import { DeviceService } from './device.service';
import { OrgService } from './org.service';
import { UserEventService } from './user-event.service';
import { RouterAuthService } from './router-auth.service';
import { OrgUserService } from './org-user.service';

import { concat, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { ExtendedOrgUser } from '../models/extended-org-user.model';

import * as LDClient from 'launchdarkly-js-client-sdk';

@Injectable({
  providedIn: 'root',
})
export class LaunchDarklyService {
  private ldClient: LDClient.LDClient;

  private isOnline: boolean;

  constructor(
    private routerAuthService: RouterAuthService,
    private orgUserService: OrgUserService,
    private orgService: OrgService,
    private networkService: NetworkService,
    private deviceService: DeviceService,
    private userEventService: UserEventService
  ) {
    this.setupNetworkWatcher();
    this.userEventService.onLogout(this.shutDownClient.bind(this));
  }

  getVariation(key: string, defaultValue: boolean) {
    return this.ldClient?.variation(key, defaultValue);
  }

  getAllFlags() {
    return this.ldClient?.allFlags();
  }

  shutDownClient() {
    if (this.isOnline && this.ldClient) {
      this.ldClient.off('initialized', this.onLDInitialized, this);
      this.ldClient.close();

      this.ldClient = null;
    }
  }

  updateIdentity() {
    if (this.ldClient) {
      this.changeUser();
    } else {
      this.initializeUser();
    }
  }

  private changeUser() {
    if (this.isOnline) {
      this.getCurrentUser()
        .pipe(filter((user) => !!user))
        .subscribe((user) => {
          this.ldClient.identify(user);
        });
    }
  }

  private initializeUser() {
    if (this.isOnline) {
      this.getCurrentUser()
        .pipe(filter((user) => !!user))
        .subscribe((user) => {
          this.ldClient = LDClient.initialize(environment.LAUNCH_DARKLY_CLIENT_ID, user);
          this.ldClient.on('initialized', this.onLDInitialized, this);
        });
    }
  }

  private onLDInitialized() {}

  private getCurrentUser(): Observable<LDClient.LDUser> {
    const isLoggedIn$ = from(this.routerAuthService.isLoggedIn());

    return isLoggedIn$.pipe(
      switchMap((isLoggedIn) => {
        if (isLoggedIn) {
          const currentEou$ = this.orgUserService.getCurrent() as Observable<ExtendedOrgUser>;
          const currentOrg$ = this.orgService.getCurrentOrg();
          const devicePlatform$ = this.deviceService.getDeviceInfo().pipe(map((device) => device.platform));

          return forkJoin([currentEou$, currentOrg$, devicePlatform$]).pipe(
            switchMap(([eou, org, platform]) => {
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
        }

        return EMPTY;
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
}
