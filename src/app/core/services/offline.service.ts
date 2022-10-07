import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { OrgSettingsService } from './org-settings.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { StorageService } from './storage.service';
import { switchMap, tap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { Cacheable, CacheBuster, globalCacheBusterNotifier } from 'ts-cacheable';
import { OrgUserSettings } from '../models/org_user_settings.model';

const orgUserSettingsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  constructor(
    private networkService: NetworkService,
    private orgSettingsService: OrgSettingsService,
    private orgUserSettingsService: OrgUserSettingsService,
    private storageService: StorageService
  ) {}

  getOrgSettings() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgSettingsService.get().pipe(
            tap((orgSettings) => {
              this.storageService.set('cachedOrgSettings', orgSettings);
            })
          );
        } else {
          return from(this.storageService.get('cachedOrgSettings'));
        }
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: orgUserSettingsCacheBuster$,
  })
  clearOrgUserSettings() {
    return of(null);
  }

  @Cacheable({
    cacheBusterObserver: orgUserSettingsCacheBuster$,
  })
  getOrgUserSettings(): Observable<OrgUserSettings> {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgUserSettingsService.get().pipe(
            tap((orgUserSettings) => {
              this.storageService.set('cachedOrgUserSettings', orgUserSettings);
            })
          );
        } else {
          return from(this.storageService.get('cachedOrgUserSettings'));
        }
      })
    );
  }

  load() {
    globalCacheBusterNotifier.next();
    const orgSettings$ = this.getOrgSettings();
    const orgUserSettings$ = this.getOrgUserSettings();

    return forkJoin([orgSettings$, orgUserSettings$]);
  }
}
