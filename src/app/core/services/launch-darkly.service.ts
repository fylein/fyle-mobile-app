import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NetworkService } from './network.service';
import { DeviceService } from './device.service';
import { UserEventService } from './user-event.service';
import { OrgService } from './org.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { concat, forkJoin, from, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import * as LDClient from 'launchdarkly-js-client-sdk';

@Injectable({
  providedIn: 'root',
})
export class LaunchDarklyService {
  private ldClient: LDClient.LDClient;

  private isOnline: boolean;

  constructor(
    private orgService: OrgService,
    private authService: AuthService,
    private networkService: NetworkService,
    private deviceService: DeviceService,
    private userEventService: UserEventService,
    private storageService: StorageService
  ) {
    this.setupNetworkWatcher();
    this.userEventService.onLogout(() => this.shutDownClient());
  }

  getVariation(key: string, defaultValue: boolean): Observable<boolean> {
    if (this.ldClient && this.isOnline) {
      return of(this.ldClient.variation(key, defaultValue));
    }

    return from(this.storageService.get('cachedLDFlags')).pipe(
      map((cachedFlags) => (cachedFlags[key] === undefined ? defaultValue : cachedFlags[key]))
    );
  }

  /* https://launchdarkly.github.io/js-client-sdk/interfaces/_launchdarkly_js_client_sdk_.ldclient.html#off
  https://launchdarkly.github.io/js-client-sdk/interfaces/_launchdarkly_js_client_sdk_.ldclient.html#close */
  shutDownClient() {
    if (this.ldClient && this.isOnline) {
      this.ldClient.off('initialized', this.updateCache, this);
      this.ldClient.off('change', this.updateCache, this);
      this.ldClient.close();

      this.ldClient = null;
    }
  }

  updateIdentity() {
    if (this.isOnline) {
      this.getCurrentUser().subscribe((user) => {
        return this.ldClient ? this.changeUser(user) : this.initializeUser(user);
      });
    }
  }

  private changeUser(user: LDClient.LDUser) {
    this.ldClient.identify(user);
  }

  private initializeUser(user: LDClient.LDUser) {
    this.ldClient = LDClient.initialize(environment.LAUNCH_DARKLY_CLIENT_ID, user);
    this.ldClient.on('initialized', this.updateCache, this);
    this.ldClient.on('change', this.updateCache, this);
  }

  private updateCache() {
    if (this.ldClient && this.isOnline) {
      const latestFlags = this.ldClient.allFlags();
      this.storageService.set('cachedLDFlags', latestFlags);
    }
  }

  private getCurrentUser(): Observable<LDClient.LDUser> {
    const currentEou$ = from(this.authService.getEou());

    return currentEou$.pipe(
      filter((eou) => !!eou),
      switchMap((eou) => {
        const currentOrg$ = this.orgService.getCurrentOrg();
        const devicePlatform$ = this.deviceService.getDeviceInfo().pipe(map((device) => device?.platform));

        return forkJoin({ currentOrg$, devicePlatform$ }).pipe(
          switchMap((res) => {
            const org = res?.currentOrg$;
            const platform = res?.devicePlatform$;

            /* HACK ALERT - Added (currentOrg as any).created_at because created_at is typed as a date but internally is a string
            Typescript complains when passed date to LaunchDarkly, only primitive types and arrays are accepted
            But since created_at is a string we have to convert currentOrg to any.
            TODO - REMOVE THIS AFTER THE ORG MODEL IS FIXED */

            const user = {
              key: eou?.ou.user_id,
              custom: {
                org_id: eou?.ou.org_id,
                org_user_id: eou?.ou.id,
                org_currency: org?.currency,
                org_created_at: (org as any)?.created_at,
                asset: `MOBILE - ${platform?.toUpperCase()}`,
              },
            };
            return of(user);
          })
        );
      })
    );
  }

  private setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).subscribe((isOnline) => {
      this.isOnline = isOnline;
      this.updateIdentity();
    });
  }
}
