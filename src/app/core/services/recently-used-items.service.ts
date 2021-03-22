import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CostCenter } from '../models/V1/cost-center.model';
import { RecentlyUsed } from '../models/V1/recently_used.model';
import { ApiService } from './api.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { map } from 'rxjs/operators';
import { ExtendedProject } from '../models/V2/extended-project.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { OrgCategoryListItem } from '../models/V1/org-category.model';
@Injectable({
  providedIn: 'root'
})
export class RecentlyUsedItemsService {

  constructor(
    private apiService: ApiService,
    private projectService: ProjectsService
  ) { }

  getRecentlyUsed():Observable<RecentlyUsed> {
    return this.apiService.get('/recently_used');
  }

  getRecentlyUsedProjects(config: {orgUserSettings: OrgUserSettings, recentValues: RecentlyUsed, eou: ExtendedOrgUser, categoryIds: string[]}): Observable<ExtendedProject[]> {
    if (config.orgUserSettings.expense_form_autofills.allowed && config.orgUserSettings.expense_form_autofills.enabled && config.recentValues 
      && config.recentValues.recent_project_ids && config.recentValues.recent_project_ids.length > 0 && config.eou) {

      return this.projectService.getByParamsUnformatted({
        orgId: config.eou.ou.org_id,
        active: true,
        sortDirection: 'asc',
        sortOrder: 'project_name',
        orgCategoryIds: config.categoryIds,
        projectIds: config.recentValues.recent_project_ids,
        offset: 0,
        limit: 10
      }).pipe(
        map(project => {
          var projectsMap = {};
          project.forEach(item => {
            projectsMap[item.project_id] = item;
          })
          return config.recentValues.recent_project_ids.map(id => projectsMap[id]).filter(id => id);
        })
      );
    } else {
      return of(null);
    }
  }

  getRecentCostCenters(costCenters, recentValue): Observable<{ label: string, value: CostCenter, selected?: boolean }[]> {
    if (costCenters && costCenters.length > 0 && recentValue && recentValue.recent_cost_center_ids && recentValue.recent_cost_center_ids.length > 0) {
      var costCentersMap = {};
      costCenters.forEach(item => {
        costCentersMap[item.value.id] = item;
      })
      const recentCostCenterList = recentValue.recent_cost_center_ids.map(id => costCentersMap[id]).filter(id => id);
      if (recentCostCenterList) {
        return of(recentCostCenterList.map(costCenter => ({ label: costCenter.value.name, value: costCenter.value })));
      } else {
        return of(null);
      }
    } else {
      return of(null);
    }
  }

  getRecentCategories(filteredCategories: OrgCategoryListItem[], recentValues: RecentlyUsed): Observable<OrgCategoryListItem[]> {
    if (filteredCategories && filteredCategories.length > 0 && recentValues && recentValues.recent_org_category_ids && recentValues.recent_org_category_ids.length > 0) {
      var categoriesMap = {};
      filteredCategories.forEach(category => {
        categoriesMap[category.value.id] = category;
      })
      return of(recentValues.recent_org_category_ids.map(id => categoriesMap[id]).filter(id => id));
    } else {
      return of(null);
    }
  }
}