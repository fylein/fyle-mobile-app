import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {ApiV2Service} from './api-v2.service';
import {map, switchMap} from 'rxjs/operators';
import {DataTransformService} from './data-transform.service';
import {Cacheable} from 'ts-cacheable';
import { Observable } from 'rxjs';
import { ExtendedProject } from '../models/V2/extended-project.model';
import { AuthService } from './auth.service';
import { from } from 'rxjs';
import { OfflineService } from './offline.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(
    private apiService: ApiService,
    private apiV2Service: ApiV2Service,
    private dataTransformService: DataTransformService
  ) { }

  getAllActive() {
    const data = {
      params: {
        active_only: true
      }
    };

    return this.apiService.get('/projects', data);
  }

  parseRawEProjects(res) {
    const rawEprojects = (res && res.data) || [];
    return rawEprojects.map((rawEproject) => {
      return this.dataTransformService.unflatten(rawEproject);
    });
  }

  getbyId(projectId: string) {
    return this.apiV2Service.get('/projects', {
      params: {
        project_id: `eq.${projectId}`
      }
    }).pipe(
      map(res => res.data[0])
    );
  }

  @Cacheable()
  getByParamsUnformatted(projectParams:
    Partial<{
      orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds
    }>): Observable<ExtendedProject[]> {
    // tslint:disable-next-line: prefer-const
    let { orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds }
      = projectParams;
    sortOrder = sortOrder || 'project_updated_at';
    sortDirection = sortDirection || 'desc';

    const params: any = {
      project_org_id: 'eq.' + orgId,
      order: sortOrder + '.' + sortDirection,
      limit: limit || 200,
      offset: offset || 0
    };

    // `active` can be optional
    if (typeof active !== 'undefined' && active !== null) {
      params.project_active = 'eq.' + active;
    }

    // `orgCategoryIds` can be optional
    if (typeof orgCategoryIds !== 'undefined' && orgCategoryIds !== null) {
      params.project_org_category_ids = 'cs.{' + orgCategoryIds.join(',') + '}';
    }

    // `projectIds` can be optional
    if (typeof projectIds !== 'undefined' && projectIds !== null) {
      params.project_id = 'in.(' + projectIds.join(',') + ')';
    }

    // `searchNameText` can be optional
    if (typeof searchNameText !== 'undefined' && searchNameText !== null) {
      params.project_name = 'ilike.%' + searchNameText + '%';
    }

    return this.apiV2Service.get('/projects', {
      params
    }).pipe(
      map(res => res.data)
    );
  }

  @Cacheable()
  getByParams(queryParams: Partial<{
    orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds 
  }>): Observable<ExtendedProject[]> {
    const {
      orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds 
    } = queryParams;
    return this
      .getByParamsUnformatted({
        orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds 
      }).pipe(
        map(this.parseRawEProjects)
      );
  }

  filterById(projectId, projects) {
    let matchingProject;

    projects.some((project) => {
      if (project.id === projectId) {
        matchingProject = project;
        return true;
      }
    });

    return matchingProject;
  }

  getAllowedOrgCategoryIds(project, activeCategoryList) {
    let categoryList = [];
    if (project) {
      categoryList = activeCategoryList.filter((category) => {
        return project.project_org_category_ids.indexOf(category.id) > -1;
      });
    } else {
      categoryList = activeCategoryList;
    }

    return categoryList;
  }
}
