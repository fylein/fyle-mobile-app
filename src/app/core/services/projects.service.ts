import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { Observable } from 'rxjs';
import { ExtendedProject } from '../models/v2/extended-project.model';
import { ProjectV1 } from '../models/v1/extended-project.model';
import { ProjectParams } from '../models/project-params.model';
import { intersection } from 'lodash';
import { OrgCategory } from '../models/v1/org-category.model';

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
      .get<ExtendedProject, {}>('/projects', {
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

  @Cacheable()
  getProjectCount(params: { categoryIds: string[] } = { categoryIds: [] }) {
    const categoryIds = params.categoryIds?.map((categoryId) => parseInt(categoryId, 10));
    return this.getAllActive().pipe(
      map((projects) => {
        const filterdProjects = projects.filter((project) => {
          if (categoryIds?.length) {
            return intersection(categoryIds, project.org_category_ids).length > 0;
          } else {
            return true;
          }
        });
        return filterdProjects.length;
      })
    );
  }

  addNameSearchFilter(searchNameText: string, params: ProjectParams) {
    if (typeof searchNameText !== 'undefined' && searchNameText !== null) {
      params.project_name = 'ilike.%' + searchNameText + '%';
    }
  }

  addProjectIdsFilter(projectIds: number[], params: ProjectParams) {
    if (typeof projectIds !== 'undefined' && projectIds !== null) {
      params.project_id = 'in.(' + projectIds.join(',') + ')';
    }
  }

  addOrgCategoryIdsFilter(orgCategoryIds: number[], params: ProjectParams) {
    if (typeof orgCategoryIds !== 'undefined' && orgCategoryIds !== null) {
      params.project_org_category_ids = 'ov.{' + orgCategoryIds.join(',') + '}';
    }
  }

  addActiveFilter(active: boolean, params: ProjectParams) {
    if (typeof active !== 'undefined' && active !== null) {
      params.project_active = 'eq.' + active;
    }
  }

  getAllowedOrgCategoryIds(project, activeCategoryList): OrgCategory[] {
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
  getAllActive(): Observable<ProjectV1[]> {
    const data = {
      params: {
        active_only: true,
      },
    };

    return this.apiService.get<ProjectV1[]>('/projects', data).pipe(
      map((res) =>
        res.map((datum) => ({
          ...datum,
          created_at: new Date(datum.created_at),
          updated_at: new Date(datum.updated_at),
        }))
      )
    );
  }

  getbyId(projectId: number | string): Observable<ExtendedProject> {
    return this.apiV2Service
      .get<ExtendedProject, {}>('/projects', {
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
