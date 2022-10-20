import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserEventService } from './user-event.service';
import { StorageService } from './storage.service';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { isEqual } from 'lodash';
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
      map((cachedFlags) => {
        if (cachedFlags) {
          return cachedFlags[key] === undefined ? defaultValue : cachedFlags[key];
        } else {
          return defaultValue;
        }
      })
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
    /**
     * Only makes LaunchDarkly call if the user has changed since the last initalization
     * This is done to avoid redundant calls
     */
    if (!this.isTheSameUser(user)) {
      this.ldClient = LDClient.initialize(environment.LAUNCH_DARKLY_CLIENT_ID, user);

      this.ldClient.on('initialized', this.updateCache, this);
      this.ldClient.on('change', this.updateCache, this);
    }
  }

  getLDClient() {
    return this.ldClient;
  }

  checkIfKeyboardPluginIsEnabled() {
    return this.getVariation('keyboard_plugin_enabled', true);
  }

  checkIfPaymentModeConfigurationsIsEnabled(): Observable<boolean> {
    return this.getVariation('payment_mode_configurations', false);
  }

  checkIfPaidByCompanyIsHidden(): Observable<boolean> {
    return this.getVariation('hide_paid_by_company', false);
  }

  checkIfAutomateReportSubmissionIsEnabled() {
    return this.getVariation('automate_report_submission_enabled', false);
  }

  // Checks if the passed in user is the same as the user which is initialized to LaunchDarkly (if any)
  private isTheSameUser(newUser: LDClient.LDUser): boolean {
    const previousUser = this.ldClient?.getUser();
    const isUserEqual = isEqual(previousUser, newUser);

    return isUserEqual;
  }

  private updateCache() {
    if (this.ldClient) {
      const latestFlags = this.ldClient.allFlags();
      this.storageService.set('cachedLDFlags', latestFlags);
    }
  }
}
