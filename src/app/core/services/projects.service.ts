import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { Observable } from 'rxjs';
import { ProjectV2 } from '../models/v2/project-v2.model';
import { ProjectV1 } from '../models/v1/extended-project.model';
import { ProjectParams } from '../models/project-params.model';
import { intersection } from 'lodash';
import { OrgCategory } from '../models/v1/org-category.model';
import { PlatformProject } from '../models/platform/platform-project.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(
    private apiService: ApiService,
    private apiV2Service: ApiV2Service,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService
  ) {}

  @Cacheable()
  getByParamsUnformatted(
    projectParams: Partial<{
      orgId: string;
      active: boolean;
      orgCategoryIds: string[];
      searchNameText: string;
      limit: number;
      offset: number;
      sortOrder: string;
      sortDirection: string;
      projectIds: number[];
    }>
  ): Observable<ProjectV2[]> {
    // eslint-disable-next-line prefer-const
    let { orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds } =
      projectParams;
    sortOrder = sortOrder || 'project_updated_at';
    sortDirection = sortDirection || 'desc';

    const params: ProjectParams = {
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
      .get<ProjectV2, {}>('/projects', {
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
  getProjectCount(params: { categoryIds: string[] } = { categoryIds: [] }): Observable<number> {
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

  addNameSearchFilter(searchNameText: string, params: ProjectParams): void {
    if (typeof searchNameText !== 'undefined' && searchNameText !== null) {
      params.project_name = 'ilike.%' + searchNameText + '%';
    }
  }

  addProjectIdsFilter(projectIds: number[], params: ProjectParams): void {
    if (typeof projectIds !== 'undefined' && projectIds !== null) {
      params.project_id = 'in.(' + projectIds.join(',') + ')';
    }
  }

  addOrgCategoryIdsFilter(orgCategoryIds: string[], params: ProjectParams): void {
    if (typeof orgCategoryIds !== 'undefined' && orgCategoryIds !== null) {
      params.project_org_category_ids = 'ov.{' + orgCategoryIds.join(',') + '}';
    }
  }

  addActiveFilter(active: boolean, params: ProjectParams): void {
    if (typeof active !== 'undefined' && active !== null) {
      params.project_active = 'eq.' + active;
    }
  }

  getAllowedOrgCategoryIds(project: ProjectParams | ProjectV2, activeCategoryList: OrgCategory[]): OrgCategory[] {
    let categoryList: OrgCategory[] = [];
    if (project) {
      categoryList = activeCategoryList.filter((category: OrgCategory) => {
        const catId = category.id;
        return project.project_org_category_ids.indexOf(catId as never) > -1;
      });
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

  getbyId(projectId: number | string): Observable<ProjectV2> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformProject[]>>('/projects', {
        params: {
          id: `eq.${projectId}`,
        },
      })
      .pipe(map((res) => this.transformToV2Response(res.data)[0]));
  }

  transformToV1Response(platformProject: PlatformProject[]): ProjectV1[] {
    const projectV1 = platformProject.map((platformProject) => ({
      id: platformProject.id,
      created_at: platformProject.created_at,
      updated_at: platformProject.updated_at,
      name: platformProject.name,
      sub_project: platformProject.sub_project,
      code: platformProject.code,
      org_id: platformProject.org_id,
      description: platformProject.description,
      active: platformProject.is_enabled,
      org_category_ids: platformProject.category_ids,
    }));

    return projectV1;
  }

  transformToV2Response(platformProject: PlatformProject[]): ProjectV2[] {
    const projectV2 = platformProject.map((platformProject) => ({
      project_active: platformProject.is_enabled,
      project_code: platformProject.code,
      project_created_at: platformProject.created_at,
      project_description: platformProject.description,
      project_id: platformProject.id,
      project_name: platformProject.name,
      project_org_category_ids: platformProject.category_ids,
      project_org_id: platformProject.org_id,
      project_updated_at: platformProject.updated_at,
      projectv2_name: platformProject.display_name,
      sub_project_name: platformProject.sub_project,
    }));

    return projectV2;
  }
}
