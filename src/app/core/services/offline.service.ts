import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { OrgSettingsService } from './org-settings.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { ProjectsService } from './projects.service';
import { OrgService } from './org.service';
import { AccountsService } from './accounts.service';
import { StorageService } from './storage.service';
import { catchError, concatMap, map, reduce, switchMap, tap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { Org } from '../models/org.model';
import { Cacheable, CacheBuster, globalCacheBusterNotifier } from 'ts-cacheable';
import { intersection } from 'lodash';
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
    private projectsService: ProjectsService,
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
  getProjects() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.projectsService.getAllActive().pipe(
            tap((projects) => {
              this.storageService.set('cachedProjects', projects);
            })
          );
        } else {
          return from(this.storageService.get('cachedProjects'));
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

  getProjectCount(params: { categoryIds: string[] } = { categoryIds: [] }) {
    return this.getProjects().pipe(
      map((projects) => {
        const filterdProjects = projects.filter((project) => {
          if (params.categoryIds.length) {
            return intersection(params.categoryIds, project.org_category_ids).length > 0;
          } else {
            return true;
          }
        });
        return filterdProjects.length;
      })
    );
  }

  load() {
    globalCacheBusterNotifier.next();
    const orgSettings$ = this.getOrgSettings();
    const orgUserSettings$ = this.getOrgUserSettings();
    const projects$ = this.getProjects();
    const expenseFieldsMap$ = this.getExpenseFieldsMap();

    return forkJoin([orgSettings$, orgUserSettings$, projects$, expenseFieldsMap$]);
  }
}
