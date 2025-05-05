import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CostCenter, CostCenters } from '../models/v1/cost-center.model';
import { RecentlyUsed } from '../models/v1/recently_used.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { map } from 'rxjs/operators';
import { ProjectV2 } from '../models/v2/project-v2.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { OrgCategory, OrgCategoryListItem } from '../models/v1/org-category.model';
import { Currency, CurrencyName } from '../models/currency.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
@Injectable({
  providedIn: 'root',
})
export class RecentlyUsedItemsService {
  constructor(private SpenderPlatformV1ApiService: SpenderPlatformV1ApiService, private projectsService: ProjectsService) {}

  formatRecentlyUsedFields(data: RecentlyUsed): RecentlyUsed {
    const idFields = ['project_ids', 'category_ids', 'cost_center_ids'] as const;
  
    return idFields.reduce((acc, field) => {
      const value = data[field];
      return {
        ...acc,
        [field]: Array.isArray(value) ? value.map(Number) : value,
      };
    }, { ...data });
  }

  getRecentlyUsed(): Observable<RecentlyUsed> {
    return this.SpenderPlatformV1ApiService
      .get<PlatformApiResponse<RecentlyUsed>>('/recently_used_fields')
      .pipe(map((res) => this.formatRecentlyUsedFields(res.data)));
  }

  getRecentlyUsedProjects(config: {
    recentValues: RecentlyUsed;
    eou: ExtendedOrgUser;
    categoryIds: string[];
    isProjectCategoryRestrictionsEnabled: boolean;
    activeCategoryList?: OrgCategory[];
  }): Observable<ProjectV2[]> {
    if (
      config.recentValues &&
      config.recentValues.project_ids &&
      config.recentValues.project_ids.length > 0 &&
      config.eou
    ) {
      return this.projectsService
        .getByParamsUnformatted(
          {
            orgId: config.eou.ou.org_id,
            isEnabled: true,
            sortDirection: 'asc',
            sortOrder: 'name',
            orgCategoryIds: config.categoryIds,
            projectIds: config.recentValues.project_ids,
            offset: 0,
            limit: 10,
          },
          config.isProjectCategoryRestrictionsEnabled,
          config.activeCategoryList
        )
        .pipe(
          map((project) => {
            const projectsMap: { [key: string]: ProjectV2 } = {};
            project.forEach((item) => {
              projectsMap[item.project_id] = item;
            });
            return config.recentValues.project_ids.map((id) => projectsMap[id]).filter((id) => id);
          })
        );
    } else {
      return of(null);
    }
  }

  getRecentCostCenters(
    costCenters: CostCenters[],
    recentValue: RecentlyUsed
  ): Observable<{ label: string; value: CostCenter; selected?: boolean }[]> {
    if (
      costCenters &&
      costCenters.length > 0 &&
      recentValue &&
      recentValue.cost_center_ids &&
      recentValue.cost_center_ids.length > 0
    ) {
      const costCentersMap: { [key: string]: CostCenters } = {};
      costCenters.forEach((item) => {
        costCentersMap[item.value.id] = item;
      });
      const recentCostCenterList = recentValue.cost_center_ids
        .map((id) => costCentersMap[id])
        .filter((id) => id);
      if (recentCostCenterList.length > 0) {
        return of(
          recentCostCenterList.map((costCenter) => ({ label: costCenter.value.name, value: costCenter.value }))
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
    recentValues: RecentlyUsed
  ): Observable<OrgCategoryListItem[]> {
    if (
      filteredCategories &&
      filteredCategories.length > 0 &&
      recentValues &&
      recentValues.category_ids &&
      recentValues.category_ids.length > 0
    ) {
      const categoriesMap: { [key: string]: OrgCategoryListItem } = {};
      filteredCategories.forEach((category) => {
        categoriesMap[category.value.id] = category;
      });
      return of(recentValues.category_ids.map((id) => categoriesMap[id]).filter((id) => id));
    } else {
      return of(null);
    }
  }

  getRecentCurrencies(currencies: CurrencyName, recentValue: RecentlyUsed): Observable<Currency[]> {
    if (currencies && recentValue && recentValue.currencies && recentValue.currencies.length > 0) {
      const recentCurrenciesList = recentValue.currencies.map((id) => ({ id, value: currencies[id] }));
      if (recentCurrenciesList) {
        return of(recentCurrenciesList.map((currency) => ({ shortCode: currency.id, longName: currency.value })));
      }
    }
    return of([] as Currency[]);
  }
}
