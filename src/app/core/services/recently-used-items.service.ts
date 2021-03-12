import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RecentlyUsed } from '../models/recently_used.model';
import { ApiService } from './api.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { map } from 'rxjs/operators';
import { ExtendedProject } from '../models/extended-project.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { OrgUserSettings } from '../models/org_user_settings.model';
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
    if (config.orgUserSettings.expense_form_autofills.allowed && config.orgUserSettings.expense_form_autofills.enabled 
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
}