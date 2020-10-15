import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';

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

  getByParamsUnformatted(projectParams:
    Partial<{
      orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds, isIndividualProjectEnabled
    }>) {
    // tslint:disable-next-line: prefer-const
    let { orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds, isIndividualProjectEnabled }
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

    // `projectIds` and `isIndividualProjectEnabled` can be optional
    if (typeof projectIds !== 'undefined' && projectIds !== null && isIndividualProjectEnabled) {
      params.project_id = 'in.(' + projectIds.join(',') + ')';
    }

    // `searchNameText` can be optional
    if (typeof searchNameText !== 'undefined' && searchNameText !== null) {
      params.project_name = 'ilike.%' + searchNameText + '%';
    }

    return this.apiV2Service.get('/projects', {
      params
    });
  }

  getByParams(queryParams: Partial<{
    orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds, isIndividualProjectEnabled
  }>) {
    const {
      orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds, isIndividualProjectEnabled
    } = queryParams;
    return this
      .getByParamsUnformatted({
        orgId, active, orgCategoryIds, searchNameText, limit, offset, sortOrder, sortDirection, projectIds, isIndividualProjectEnabled
      }).pipe(
        map(this.parseRawEProjects)
      );
  }
}
