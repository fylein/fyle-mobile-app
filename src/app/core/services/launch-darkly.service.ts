import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserEventService } from './user-event.service';
import { StorageService } from './storage.service';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as LDClient from 'launchdarkly-js-client-sdk';

@Injectable({
  providedIn: 'root',
})
export class LaunchDarklyService {
  private ldClient: LDClient.LDClient;

  constructor(private userEventService: UserEventService, private storageService: StorageService) {
    this.userEventService.onLogout(() => this.shutDownClient());
  }

  getVariation(key: string, defaultValue: boolean): Observable<boolean> {
    if (this.ldClient) {
      return of(this.ldClient.variation(key, defaultValue));
    }

    return from(this.storageService.get('cachedLDFlags')).pipe(
      map((cachedFlags) => (cachedFlags[key] === undefined ? defaultValue : cachedFlags[key]))
    );
  }

  /**
   * https://launchdarkly.github.io/js-client-sdk/interfaces/_launchdarkly_js_client_sdk_.ldclient.html#off
   * https://launchdarkly.github.io/js-client-sdk/interfaces/_launchdarkly_js_client_sdk_.ldclient.html#close
   */
  shutDownClient() {
    if (this.ldClient) {
      this.ldClient.off('initialized', this.updateCache, this);
      this.ldClient.off('change', this.updateCache, this);
      this.ldClient.close();

      this.ldClient = null;
    }
  }

  initializeUser(user: LDClient.LDUser) {
    this.ldClient = LDClient.initialize(environment.LAUNCH_DARKLY_CLIENT_ID, user);

    this.ldClient.on('initialized', this.updateCache, this);
    this.ldClient.on('change', this.updateCache, this);
  }

  private updateCache() {
    if (this.ldClient) {
      const latestFlags = this.ldClient.allFlags();
      this.storageService.set('cachedLDFlags', latestFlags);
    }
  }
}
