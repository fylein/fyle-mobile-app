import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { Cacheable } from 'ts-cacheable';
import { Observable } from 'rxjs';
import { ExtendedProject } from '../models/v2/extended-project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(private apiService: ApiService, private apiV2Service: ApiV2Service) {}

  @Cacheable()
  getByParamsUnformatted(
    projectParams: Partial<{
      orgId;
      active;
      orgCategoryIds;
      searchNameText;
      limit;
      offset;
      sortOrder;
      sortDirection;
      projectIds;
    }>
  ): Observable<ExtendedProject[]> {
    // eslint-disable-next-line prefer-const
    let { orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds } =
      projectParams;
    sortOrder = sortOrder || 'project_updated_at';
    sortDirection = sortDirection || 'desc';

    const params: any = {
      project_org_id: 'eq.' + orgId,
      order: sortOrder + '.' + sortDirection,
      limit: limit || 200,
      offset: offset || 0,
    };

    // `active` can be optional
    this.addActiveFilter(active, params);

    // `orgCategoryIds` can be optional
    this.addOrgCategoryIdsFilter(orgCategoryIds, params);

    // `projectIds` can be optional
    this.addProjectIdsFilter(projectIds, params);

    // `searchNameText` can be optional
    this.addNameSearchFilter(searchNameText, params);

    return this.apiV2Service
      .get('/projects', {
        params,
      })
      .pipe(
        map((res) =>
          res.data.map((datum) => ({
            ...datum,
            project_created_at: new Date(datum.project_created_at),
            project_updated_at: new Date(datum.project_updated_at),
          }))
        )
      );
  }

  addNameSearchFilter(searchNameText: any, params: any) {
    if (typeof searchNameText !== 'undefined' && searchNameText !== null) {
      params.project_name = 'ilike.%' + searchNameText + '%';
    }
  }

  addProjectIdsFilter(projectIds: any, params: any) {
    if (typeof projectIds !== 'undefined' && projectIds !== null) {
      params.project_id = 'in.(' + projectIds.join(',') + ')';
    }
  }

  addOrgCategoryIdsFilter(orgCategoryIds: any, params: any) {
    if (typeof orgCategoryIds !== 'undefined' && orgCategoryIds !== null) {
      params.project_org_category_ids = 'cs.{' + orgCategoryIds.join(',') + '}';
    }
  }

  addActiveFilter(active: any, params: any) {
    if (typeof active !== 'undefined' && active !== null) {
      params.project_active = 'eq.' + active;
    }
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
      categoryList = activeCategoryList.filter(
        (category) => project.project_org_category_ids.indexOf(category.id) > -1
      );
    } else {
      categoryList = activeCategoryList;
    }

    return categoryList;
  }

  // TODO: We should remove this from being used and replace with transform
  getAllActive() {
    const data = {
      params: {
        active_only: true,
      },
    };

    return this.apiService.get('/projects', data);
  }

  getbyId(projectId: number): Observable<ExtendedProject> {
    return this.apiV2Service
      .get('/projects', {
        params: {
          project_id: `eq.${projectId}`,
        },
      })
      .pipe(
        map(
          (res) =>
            res.data.map((datum) => ({
              ...datum,
              project_created_at: new Date(datum.project_created_at),
              project_updated_at: new Date(datum.project_updated_at),
            }))[0]
        )
      );
  }
}
