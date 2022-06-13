import { Injectable } from '@angular/core';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { Observable, range } from 'rxjs';
import { ExtendedProject } from '../models/v2/extended-project.model';
import { Project } from '../models/v1/project.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformProject } from '../models/platform/platform-project.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { CategoriesService } from './categories.service';
import { OrgCategory } from '../models/v1/org-category.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  restrictedCategories: number[];

  constructor(
    private spenderPlatformApiService: SpenderPlatformApiService,
    private categoriesService: CategoriesService
  ) {}

  @Cacheable()
  getByParamsUnformatted(
    projectParams: Partial<{
      orgId;
      is_enabled;
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
    let { orgId, is_enabled, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds } =
      projectParams;
    sortOrder = sortOrder || 'updated_at';
    sortDirection = sortDirection || 'desc';

    const params: any = {
      org_id: 'eq.' + orgId,
      order: sortOrder + '.' + sortDirection,
      limit: limit || 200,
      offset: offset || 0,
    };

    // `active` can be optional
    this.addActiveFilter(is_enabled, params);

    // `orgCategoryIds` can be optional
    this.addOrgCategoryIdsFilter(orgCategoryIds, params);

    // `projectIds` can be optional
    this.addProjectIdsFilter(projectIds, params);

    // `searchNameText` can be optional
    this.addNameSearchFilter(searchNameText, params);

    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformProject>>('/projects', {
        params,
      })
      .pipe(
        map((res) => this.transformFromPlatfromToApiV2(res.data)),
        map((res) =>
          res.map((datum) => ({
            ...datum,
            project_created_at: new Date(datum.project_created_at),
            project_updated_at: new Date(datum.project_updated_at),
          }))
        )
      );
  }

  addNameSearchFilter(searchNameText: any, params: any) {
    if (typeof searchNameText !== 'undefined' && searchNameText !== null) {
      params.name = 'ilike.%' + searchNameText + '%';
    }
  }

  addProjectIdsFilter(projectIds: any, params: any) {
    if (typeof projectIds !== 'undefined' && projectIds !== null) {
      params.id = 'in.(' + projectIds.join(',') + ')';
    }
  }

  addOrgCategoryIdsFilter(orgCategoryIds: any, params: any) {
    if (typeof orgCategoryIds !== 'undefined' && orgCategoryIds !== null) {
      params.project_org_category_ids = 'cs.{' + orgCategoryIds.join(',') + '}';
    }
  }

  addActiveFilter(active: any, params: any) {
    if (typeof active !== 'undefined' && active !== null) {
      params.is_enabled = 'eq.' + active;
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
    let restrictedList = [];

    if (project) {
      this.categoriesService
        .getCategoriesByRestrictedProjectIds(project.project_id)
        .pipe()
        .subscribe((res) => {
          console.log('check what is res->', res);
          console.log('check res. list 1 -> ', restrictedList);
          restrictedList = res.map((res) => res.id);
          console.log('check res. list 2 -> ', restrictedList);
          categoryList = activeCategoryList.filter(
            (category: OrgCategory) => restrictedList?.indexOf(category.id) > -1
          );
        });
    } else {
      categoryList = activeCategoryList;
    }

    return categoryList;
  }

  transformFromPlatfromToApiV1(platformProject: PlatformProject[]): Project[] {
    let oldV1Project = [];
    oldV1Project = platformProject.map((project) => ({
      active: project.is_enabled,
      code: project.code,
      created_at: project.created_at,
      description: project.description,
      id: project.id,
      name: project.name,
      org_id: project.org_id,
      sub_project: project.sub_project,
      updated_at: project.updated_at,
    }));

    return oldV1Project;
  }

  transformFromPlatfromToApiV2(platformProject: PlatformProject[]): ExtendedProject[] {
    let oldV2Project = [];
    oldV2Project = platformProject.map((project) => ({
      project_active: project.is_enabled,
      project_code: project.code,
      project_created_at: project.created_at,
      project_description: project.description,
      project_id: project.id,
      project_name: project.name,
      project_org_id: project.org_id,
      project_updated_at: project.updated_at,
      projectv2_name: project.name,
      sub_project_name: project.sub_project,
    }));

    return oldV2Project;
  }

  getAllActive(): Observable<Project[]> {
    return this.getActiveProjectsCount().pipe(
      switchMap((count) => {
        count = count > 50 ? count / 50 : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getProjects({ offset: 50 * page, limit: 50 })),
      reduce((acc, curr) => acc.concat(curr), [] as Project[])
    );
  }

  getActiveProjectsCount(): Observable<number> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformProject>>('/projects', data)
      .pipe(map((res) => res.count));
  }

  getProjects(config: { offset: number; limit: number }): Observable<Project[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformProject>>('/projects', data)
      .pipe(map((res) => this.transformFromPlatfromToApiV1(res.data)));
  }

  getbyId(projectId: number): Observable<ExtendedProject> {
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformProject>>('/projects', {
        params: {
          id: 'eq.' + projectId,
        },
      })
      .pipe(
        map((res) => this.transformFromPlatfromToApiV2(res.data)),
        map(
          (res) =>
            res.map((datum) => ({
              ...datum,
              project_created_at: new Date(datum.project_created_at),
              project_updated_at: new Date(datum.project_updated_at),
            }))[0]
        )
      );
  }
}
