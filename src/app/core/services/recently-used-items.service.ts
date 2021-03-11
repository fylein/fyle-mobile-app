import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CostCenter } from '../models/cost-center.model';
import { RecentlyUsed } from '../models/recently_used.model';
import {ApiService} from './api.service';
import {ProjectsService} from 'src/app/core/services/projects.service';
import {map} from 'rxjs/operators';
import { ExtendedProject } from '../models/extended-project.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { String } from 'lodash';

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

  getRecentlyUsedProjects(config: {orgUserSettings: OrgUserSettings, recentValue: RecentlyUsed, eou: ExtendedOrgUser, categoryIds: string[]}): Observable<ExtendedProject[]> {
    if (config.orgUserSettings.expense_form_autofills.allowed && config.orgUserSettings.expense_form_autofills.enabled 
      && config.recentValue.recent_project_ids && config.recentValue.recent_project_ids.length > 0 && config.eou) {

      return this.projectService.getByParamsUnformatted({
        orgId: config.eou.ou.org_id,
        active: true,
        sortDirection: 'asc',
        sortOrder: 'project_name',
        orgCategoryIds: config.categoryIds,
        projectIds: config.recentValue.recent_project_ids,
        searchNameText: null,
        offset: 0,
        limit: 10
      }).pipe(
        map(project => {
          var projectsMap = {};
          project.forEach(item => {
            projectsMap[item.project_id] = item;
          })
          return config.recentValue.recent_project_ids.map(id => projectsMap[id]).filter(id => id);
        })
      );
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
}