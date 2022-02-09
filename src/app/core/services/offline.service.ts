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
import { StorageService } from './storage.service';
import { CurrencyService } from './currency.service';
import { catchError, concatMap, map, reduce, switchMap, tap } from 'rxjs/operators';
import { forkJoin, from, Observable } from 'rxjs';
import { PermissionsService } from './permissions.service';
import { Org } from '../models/org.model';
import { Cacheable, globalCacheBusterNotifier } from 'ts-cacheable';
import { OrgUserService } from './org-user.service';
import { intersection } from 'lodash';
import { DeviceService } from './device.service';
import { ExpenseFieldsService } from './expense-fields.service';
import { ExpenseFieldsMap } from '../models/v1/expense-fields-map.model';
import { ExpenseField } from '../models/v1/expense-field.model';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { TaxGroupService } from './tax_group.service';

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
    private storageService: StorageService,
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
              this.storageService.set('delegatedAccounts', orgSettings);
            })
          );
        } else {
          return from(this.storageService.get('delegatedAccounts'));
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
              this.storageService.set('cachedCurrencies', orgSettings);
            })
          );
        } else {
          return from(this.storageService.get('cachedCurrencies'));
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
              this.storageService.set('cachedOrgSettings', orgSettings);
            })
          );
        } else {
          return from(this.storageService.get('cachedOrgSettings'));
        }
      })
    );
  }

  @Cacheable()
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
              this.storageService.set('cachedTaxGroups', taxGroups);
            })
          );
        } else {
          return from(this.storageService.get('cachedTaxGroups'));
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
              this.storageService.set('allowedCostCenters', allowedCostCenters);
            })
          );
        } else {
          return from(this.storageService.get('allowedCostCenters'));
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
              this.storageService.set('defaultCostCenter', defaultCostCenter);
            })
          );
        } else {
          return from(this.storageService.get('defaultCostCenter'));
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
              this.storageService.set('cachedHomeCurrency', homeCurrency);
            })
          );
        } else {
          return from(this.storageService.get('cachedHomeCurrency'));
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
              this.storageService.set('cachedCategories', categories);
            })
          );
        } else {
          return from(this.storageService.get('cachedCategories'));
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
              this.storageService.set('cachedPaymentModeAccounts', accounts);
            })
          );
        } else {
          return from(this.storageService.get('cachedPaymentModeAccounts'));
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
              this.storageService.set('cachedCostCenters', costCenters);
            })
          );
        } else {
          return from(this.storageService.get('cachedCostCenters'));
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
  getPerDiemRates() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.perDiemsService.getRates().pipe(
            tap((rates) => {
              this.storageService.set('cachedPerDiemRates', rates);
            })
          );
        } else {
          return from(this.storageService.get('cachedPerDiemRates'));
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
  getPrimaryOrg() {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgService.getPrimaryOrg().pipe(
            tap((primaryOrg) => {
              this.storageService.set('cachedPrimaryOrg', primaryOrg);
            })
          );
        } else {
          return from(this.storageService.get('cachedPrimaryOrg'));
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
    return from(this.storageService.get('activeExpenseTab'));
  }

  setActiveExpenseTab(activeTab) {
    return from(this.storageService.set('activeExpenseTab', activeTab));
  }

  setActiveCorporateCardExpenseTab(activeTab) {
    return from(this.storageService.set('activeCorporateCardExpenseTab', activeTab));
  }

  getActiveCorporateCardExpenseTab() {
    return from(this.storageService.get('activeCorporateCardExpenseTab'));
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
