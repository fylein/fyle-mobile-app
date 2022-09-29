import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { OrgSettingsService } from './org-settings.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { ProjectsService } from './projects.service';
import { CustomInputsService } from './custom-inputs.service';
import { OrgService } from './org.service';
import { AccountsService } from './accounts.service';
import { StorageService } from './storage.service';
import { catchError, concatMap, map, reduce, switchMap, tap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { PermissionsService } from './permissions.service';
import { Org } from '../models/org.model';
import { Cacheable, CacheBuster, globalCacheBusterNotifier } from 'ts-cacheable';
import { OrgUserService } from './org-user.service';
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
    private customInputsService: CustomInputsService,
    private orgService: OrgService,
    private accountsService: AccountsService,
    private storageService: StorageService,
    private permissionsService: PermissionsService,
    private orgUserService: OrgUserService,
    private expenseFieldsService: ExpenseFieldsService
  ) {}

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
  getCustomInputs(): Observable<ExpenseField[]> {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.customInputsService.getAll(true).pipe(
            tap((customInputs) => {
              this.storageService.set('cachedCustomInputs', customInputs);
            })
          );
        } else {
          return from(this.storageService.get('cachedCustomInputs'));
        }
      })
    );
  }

  @Cacheable()
  getCurrentOrg() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgService.getCurrentOrg().pipe(
            tap((currentOrg) => {
              this.storageService.set('cachedCurrentOrg', currentOrg);
            })
          );
        } else {
          return from(this.storageService.get('cachedCurrentOrg'));
        }
      })
    );
  }

  @Cacheable()
  getOrgs() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgService.getOrgs().pipe(
            tap((orgs) => {
              this.storageService.set('cachedOrgs', orgs);
            })
          );
        } else {
          return from(this.storageService.get('cachedOrgs')).pipe(map((data) => data as Org[]));
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

  getReportActions(orgSettings) {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.getReportPermissions(orgSettings).pipe(
            tap((allowedActions) => {
              this.storageService.set('cachedReportActions', allowedActions);
            })
          );
        } else {
          return from(this.storageService.get('cachedReportActions'));
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
    const orgUserSettings$ = this.getOrgUserSettings();
    const projects$ = this.getProjects();
    const customInputs$ = this.getCustomInputs();
    const currentOrg$ = this.getCurrentOrg();
    const orgs$ = this.getOrgs();
    const expenseFieldsMap$ = this.getExpenseFieldsMap();

    return forkJoin([orgUserSettings$, projects$, customInputs$, currentOrg$, orgs$, expenseFieldsMap$]);
  }

  getCurrentUser() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgUserService.getCurrent().pipe(
            tap((currentUser) => {
              this.storageService.set('currentUser', currentUser);
            })
          );
        } else {
          return from(this.storageService.get('currentUser'));
        }
      })
    );
  }

  private getReportPermissions(orgSettings) {
    return this.permissionsService
      .allowedActions('reports', ['approve', 'create', 'delete'], orgSettings)
      .pipe(catchError((err) => []));
  }
}
