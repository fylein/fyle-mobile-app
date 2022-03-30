import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { AppVersionService } from './app-version.service';
import { OrgSettingsService } from './org-settings.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { CategoriesService } from './categories.service';
import { CostCentersService } from './cost-centers.service';
import { ProjectsService } from './projects.service';
import { PerDiemService } from './per-diem.service';
import { CustomInputsService } from './custom-inputs.service';
import { OrgService } from './org.service';
import { AccountsService } from './accounts.service';
import { SecureStorageService } from './secure-storage.service';
import { CurrencyService } from './currency.service';
import { catchError, concatMap, map, reduce, switchMap, tap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { PermissionsService } from './permissions.service';
import { Org } from '../models/org.model';
import { Cacheable, CacheBuster, globalCacheBusterNotifier } from 'ts-cacheable';
import { OrgUserService } from './org-user.service';
import { intersection } from 'lodash';
import { DeviceService } from './device.service';
import { ExpenseFieldsService } from './expense-fields.service';
import { ExpenseFieldsMap } from '../models/v1/expense-fields-map.model';
import { ExpenseField } from '../models/v1/expense-field.model';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { TaxGroupService } from './tax_group.service';

const orgUserSettingsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  constructor(
    private networkService: NetworkService,
    private appVersionService: AppVersionService,
    private orgSettingsService: OrgSettingsService,
    private orgUserSettingsService: OrgUserSettingsService,
    private categoriesService: CategoriesService,
    private costCentersService: CostCentersService,
    private projectsService: ProjectsService,
    private perDiemsService: PerDiemService,
    private customInputsService: CustomInputsService,
    private orgService: OrgService,
    private accountsService: AccountsService,
    private currencyService: CurrencyService,
    private secureStorageService: SecureStorageService,
    private permissionsService: PermissionsService,
    private orgUserService: OrgUserService,
    private deviceService: DeviceService,
    private expenseFieldsService: ExpenseFieldsService,
    private taxGroupService: TaxGroupService
  ) {}

  @Cacheable()
  getDelegatedAccounts() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgUserService.findDelegatedAccounts().pipe(
            tap((orgSettings) => {
              this.secureStorageService.set('delegatedAccounts', orgSettings);
            })
          );
        } else {
          return from(this.secureStorageService.get('delegatedAccounts'));
        }
      })
    );
  }

  @Cacheable()
  getCurrencies() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.currencyService.getAll().pipe(
            tap((orgSettings) => {
              this.secureStorageService.set('cachedCurrencies', orgSettings);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedCurrencies'));
        }
      })
    );
  }

  @Cacheable()
  getOrgSettings() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgSettingsService.get().pipe(
            tap((orgSettings) => {
              this.secureStorageService.set('cachedOrgSettings', orgSettings);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedOrgSettings'));
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
              this.secureStorageService.set('cachedOrgUserSettings', orgUserSettings);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedOrgUserSettings'));
        }
      })
    );
  }

  @Cacheable()
  getOrgUserMileageSettings() {
    return this.getOrgUserSettings().pipe(map((res: any) => res.mileage_settings));
  }

  @Cacheable()
  getEnabledTaxGroups() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          const params = {
            is_enabled: 'eq.true',
          };
          return this.taxGroupService.get(params).pipe(
            tap((taxGroups) => {
              this.secureStorageService.set('cachedTaxGroups', taxGroups);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedTaxGroups'));
        }
      })
    );
  }

  @Cacheable()
  getAllowedCostCenters(orgUserSettings) {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgUserSettingsService.getAllowedCostCenteres(orgUserSettings).pipe(
            tap((allowedCostCenters) => {
              this.secureStorageService.set('allowedCostCenters', allowedCostCenters);
            })
          );
        } else {
          return from(this.secureStorageService.get('allowedCostCenters'));
        }
      })
    );
  }

  @Cacheable()
  getDefaultCostCenter() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgUserSettingsService.getDefaultCostCenter().pipe(
            tap((defaultCostCenter) => {
              this.secureStorageService.set('defaultCostCenter', defaultCostCenter);
            })
          );
        } else {
          return from(this.secureStorageService.get('defaultCostCenter'));
        }
      })
    );
  }

  @Cacheable()
  getHomeCurrency() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.currencyService.getHomeCurrency().pipe(
            tap((homeCurrency) => {
              this.secureStorageService.set('cachedHomeCurrency', homeCurrency);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedHomeCurrency'));
        }
      })
    );
  }

  @Cacheable()
  getAllCategories() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.categoriesService.getAll().pipe(
            tap((categories) => {
              this.secureStorageService.set('cachedCategories', categories);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedCategories'));
        }
      })
    );
  }

  @Cacheable()
  getAllEnabledCategories() {
    return this.getAllCategories().pipe(
      map((categories) => categories.filter((category) => category.enabled === true))
    );
  }

  @Cacheable()
  getAccounts() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.accountsService.getEMyAccounts().pipe(
            tap((accounts) => {
              this.secureStorageService.set('cachedPaymentModeAccounts', accounts);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedPaymentModeAccounts'));
        }
      })
    );
  }

  @Cacheable()
  getCostCenters() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.costCentersService.getAllActive().pipe(
            tap((costCenters) => {
              this.secureStorageService.set('cachedCostCenters', costCenters);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedCostCenters'));
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
              this.secureStorageService.set('cachedProjects', projects);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedProjects'));
        }
      })
    );
  }

  @Cacheable()
  getPerDiemRates() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.perDiemsService.getRates().pipe(
            tap((rates) => {
              this.secureStorageService.set('cachedPerDiemRates', rates);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedPerDiemRates'));
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
              this.secureStorageService.set('cachedCustomInputs', customInputs);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedCustomInputs'));
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
              this.secureStorageService.set('cachedCurrentOrg', currentOrg);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedCurrentOrg'));
        }
      })
    );
  }

  @Cacheable()
  getPrimaryOrg() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgService.getPrimaryOrg().pipe(
            tap((primaryOrg) => {
              this.secureStorageService.set('cachedPrimaryOrg', primaryOrg);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedPrimaryOrg'));
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
              this.secureStorageService.set('cachedOrgs', orgs);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedOrgs')).pipe(map((data) => data as Org[]));
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
              this.secureStorageService.set('cachedAllExpenseFields', allExpenseFields);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedAllExpenseFields'));
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
              this.secureStorageService.set('cachedExpenseFieldsMap', expenseFieldMap);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedExpenseFieldsMap'));
        }
      })
    );
  }

  @Cacheable()
  getAllowedPerDiems(allPerDiemRates) {
    return this.getOrgUserSettings().pipe(
      map((settings) => {
        let allowedPerDiems = [];

        if (settings && settings.per_diem_rate_settings && settings.per_diem_rate_settings.allowed_per_diem_ids) {
          const allowedPerDiemIds = settings.per_diem_rate_settings.allowed_per_diem_ids;

          if (allPerDiemRates && allPerDiemRates.length > 0) {
            allowedPerDiems = allPerDiemRates.filter((perDiem) => allowedPerDiemIds.indexOf(perDiem.id) > -1);
          }
        }

        return allowedPerDiems;
      })
    );
  }

  getActiveExpenseTab() {
    return from(this.secureStorageService.get('activeExpenseTab'));
  }

  setActiveExpenseTab(activeTab) {
    return from(this.secureStorageService.set('activeExpenseTab', activeTab));
  }

  setActiveCorporateCardExpenseTab(activeTab) {
    return from(this.secureStorageService.set('activeCorporateCardExpenseTab', activeTab));
  }

  getActiveCorporateCardExpenseTab() {
    return from(this.secureStorageService.get('activeCorporateCardExpenseTab'));
  }

  getReportActions(orgSettings) {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.getReportPermissions(orgSettings).pipe(
            tap((allowedActions) => {
              this.secureStorageService.set('cachedReportActions', allowedActions);
            })
          );
        } else {
          return from(this.secureStorageService.get('cachedReportActions'));
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
    const allCategories$ = this.getAllCategories();
    const allEnabledCategories$ = this.getAllEnabledCategories();
    const costCenters$ = this.getCostCenters();
    const projects$ = this.getProjects();
    const perDiemRates$ = this.getPerDiemRates();
    const customInputs$ = this.getCustomInputs();
    const currentOrg$ = this.getCurrentOrg();
    const primaryOrg$ = this.getPrimaryOrg();
    const orgs$ = this.getOrgs();
    const accounts$ = this.getAccounts();
    const expenseFieldsMap$ = this.getExpenseFieldsMap();
    const currencies$ = this.getCurrencies();
    const homeCurrency$ = this.getHomeCurrency();
    const delegatedAccounts$ = this.getDelegatedAccounts();
    const taxGroups$ = this.getEnabledTaxGroups();

    this.deviceService.getDeviceInfo().subscribe((deviceInfo) => {
      if (deviceInfo.platform.toLowerCase() === 'ios' || deviceInfo.platform.toLowerCase() === 'android') {
        this.appVersionService.load();
      }
    });

    return forkJoin([
      orgSettings$,
      orgUserSettings$,
      allCategories$,
      allEnabledCategories$,
      costCenters$,
      projects$,
      perDiemRates$,
      customInputs$,
      currentOrg$,
      primaryOrg$,
      orgs$,
      accounts$,
      expenseFieldsMap$,
      currencies$,
      homeCurrency$,
      delegatedAccounts$,
      taxGroups$,
    ]);
  }

  getCurrentUser() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgUserService.getCurrent().pipe(
            tap((currentUser) => {
              this.secureStorageService.set('currentUser', currentUser);
            })
          );
        } else {
          return from(this.secureStorageService.get('currentUser'));
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
