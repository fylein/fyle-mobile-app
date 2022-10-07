import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { OrgSettingsService } from './org-settings.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { OrgService } from './org.service';
import { AccountsService } from './accounts.service';
import { StorageService } from './storage.service';
import { switchMap, tap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { Cacheable, CacheBuster, globalCacheBusterNotifier } from 'ts-cacheable';
import { ExpenseFieldsService } from './expense-fields.service';
import { ExpenseFieldsMap } from '../models/v1/expense-fields-map.model';
import { ExpenseField } from '../models/v1/expense-field.model';
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
    private orgService: OrgService,
    private accountsService: AccountsService,
    private storageService: StorageService,
    private expenseFieldsService: ExpenseFieldsService
  ) {}

  @Cacheable()
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

  @Cacheable()
  getAllEnabledExpenseFields(): Observable<ExpenseField[]> {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.expenseFieldsService.getAllEnabled().pipe(
            tap((allExpenseFields) => {
              this.storageService.set('cachedAllExpenseFields', allExpenseFields);
            })
          );
        } else {
          return from(this.storageService.get('cachedAllExpenseFields'));
        }
      })
    );
  }

  @Cacheable()
  getExpenseFieldsMap(): Observable<Partial<ExpenseFieldsMap>> {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.expenseFieldsService.getAllMap().pipe(
            tap((expenseFieldMap) => {
              this.storageService.set('cachedExpenseFieldsMap', expenseFieldMap);
            })
          );
        } else {
          return from(this.storageService.get('cachedExpenseFieldsMap'));
        }
      })
    );
  }

  load() {
    globalCacheBusterNotifier.next();
    const orgSettings$ = this.getOrgSettings();
    const orgUserSettings$ = this.getOrgUserSettings();
    const expenseFieldsMap$ = this.getExpenseFieldsMap();

    return forkJoin([orgSettings$, orgUserSettings$, expenseFieldsMap$]);
  }
}
