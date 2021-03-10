import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RecentlyUsed } from '../models/recently_used.model';
import {ApiService} from './api.service';
import {ProjectsService} from 'src/app/core/services/projects.service';
import {map} from 'rxjs/operators';
import { ExtendedProject } from '../models/extendedProject.model';

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

  getRecentlyUsedProjects(orgUserSettings, recentValue, eou, categoryIds):Observable<ExtendedProject[]> {
    if (orgUserSettings.expense_form_autofills.allowed && orgUserSettings.expense_form_autofills.enabled 
      && recentValue.recent_project_ids && recentValue.recent_project_ids.length > 0 && eou) {

      return this.projectService.getByParamsUnformatted({
        orgId: eou.ou.org_id,
        active: true,
        sortDirection: 'asc',
        sortOrder: 'project_name',
        orgCategoryIds: categoryIds,
        projectIds: recentValue.recent_project_ids,
        searchNameText: null,
        offset: 0,
        limit: 10
      }).pipe(
        map(project => {
          var projectsMap = {};
          project.forEach(item => {
            projectsMap[item.project_id] = item;
          })
          return recentValue.recent_project_ids.map(id => projectsMap[id]).filter(id => id);
        })
      );
    } else {
      return of(null);
    }
  }
}