import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CostCenter, CostCenters } from '../models/v1/cost-center.model';
import { RecentlyUsed } from '../models/v1/recently_used.model';
import { ApiService } from './api.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { map } from 'rxjs/operators';
import { ExtendedProject } from '../models/v2/extended-project.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { OrgCategoryListItem } from '../models/v1/org-category.model';
import { Currency, CurrencyName } from '../models/currency.model';
@Injectable({
  providedIn: 'root',
})
export class RecentlyUsedItemsService {
  constructor(
    private apiService: ApiService,
    private projectService: ProjectsService,
  ) {}

  getRecentlyUsed(): Observable<RecentlyUsed> {
    return this.apiService.get('/recently_used');
  }

  getRecentlyUsedProjects(config: {
    recentValues: RecentlyUsed;
    eou: ExtendedOrgUser;
    categoryIds: string[];
  }): Observable<ExtendedProject[]> {
    if (
      config.recentValues &&
      config.recentValues.recent_project_ids &&
      config.recentValues.recent_project_ids.length > 0 &&
      config.eou
    ) {
      return this.projectService
        .getByParamsUnformatted({
          orgId: config.eou.ou.org_id,
          active: true,
          sortDirection: 'asc',
          sortOrder: 'project_name',
          orgCategoryIds: config.categoryIds,
          projectIds: config.recentValues.recent_project_ids,
          offset: 0,
          limit: 10,
        })
        .pipe(
          map((project) => {
            const projectsMap: { [key: string]: ExtendedProject } = {};
            project.forEach((item) => {
              projectsMap[item.project_id] = item;
            });
            return config.recentValues.recent_project_ids.map((id) => projectsMap[id]).filter((id) => id);
          }),
        );
    } else {
      return of(null);
    }
  }

  getRecentCostCenters(
    costCenters: CostCenters[],
    recentValue: RecentlyUsed,
  ): Observable<{ label: string; value: CostCenter; selected?: boolean }[]> {
    if (
      costCenters &&
      costCenters.length > 0 &&
      recentValue &&
      recentValue.recent_cost_center_ids &&
      recentValue.recent_cost_center_ids.length > 0
    ) {
      const costCentersMap: { [key: string]: CostCenters } = {};
      costCenters.forEach((item) => {
        costCentersMap[item.value.id] = item;
      });
      const recentCostCenterList = recentValue.recent_cost_center_ids
        .map((id) => costCentersMap[id])
        .filter((id) => id);
      if (recentCostCenterList.length > 0) {
        return of(
          recentCostCenterList.map((costCenter) => ({ label: costCenter.value.name, value: costCenter.value })),
        );
      } else {
        return of(null);
      }
    } else {
      return of(null);
    }
  }

  getRecentCategories(
    filteredCategories: OrgCategoryListItem[],
    recentValues: RecentlyUsed,
  ): Observable<OrgCategoryListItem[]> {
    if (
      filteredCategories &&
      filteredCategories.length > 0 &&
      recentValues &&
      recentValues.recent_org_category_ids &&
      recentValues.recent_org_category_ids.length > 0
    ) {
      const categoriesMap: { [key: string]: OrgCategoryListItem } = {};
      filteredCategories.forEach((category) => {
        categoriesMap[category.value.id] = category;
      });
      return of(recentValues.recent_org_category_ids.map((id) => categoriesMap[id]).filter((id) => id));
    } else {
      return of(null);
    }
  }

  getRecentCurrencies(currencies: CurrencyName, recentValue: RecentlyUsed): Observable<Currency[]> {
    if (currencies && recentValue && recentValue.recent_currencies && recentValue.recent_currencies.length > 0) {
      const recentCurrenciesList = recentValue.recent_currencies.map((id) => ({ id, value: currencies[id] }));
      if (recentCurrenciesList) {
        return of(recentCurrenciesList.map((currency) => ({ shortCode: currency.id, longName: currency.value })));
      }
    }
    return of([] as Currency[]);
  }
}
