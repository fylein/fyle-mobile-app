import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import {
  apiResponseActiveOnly,
  apiV2ResponseMultiple,
  apiV2ResponseSingle,
  testActiveCategoryList,
  allowedActiveCategories,
  expectedProjectsResponse,
  testProjectParams,
  testProject,
  testCategoryIds,
} from '../test-data/projects.spec.data';
import { ProjectsService } from './projects.service';

const fixDate = (data) =>
  data.map((datum) => ({
    ...datum,
    project_created_at: new Date(datum.project_created_at),
    project_updated_at: new Date(datum.project_updated_at),
  }));

describe('ProjectsService', () => {
  let projectService: ProjectsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);

    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiv2ServiceSpy,
        },
      ],
    });
    projectService = TestBed.inject(ProjectsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
  });

  it('should be created', () => {
    expect(projectService).toBeTruthy();
  });

  it('should be able to fetch project by id', (done) => {
    apiV2Service.get.and.returnValue(of(apiV2ResponseSingle));
    projectService.getbyId(257528).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseSingle.data)[0]);
      done();
    });

    expect(apiV2Service.get).toHaveBeenCalledWith('/projects', {
      params: {
        project_id: 'eq.257528',
      },
    });
  });

  it('should be able to fetch all active projects', (done) => {
    apiService.get.and.returnValue(of(apiResponseActiveOnly));
    projectService.getAllActive().subscribe((res) => {
      expect(res).toEqual(apiResponseActiveOnly);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith('/projects', {
      params: {
        active_only: true,
      },
    });
  });

  it('should be able to fetch data when no params provided', (done) => {
    apiV2Service.get.and.returnValue(of(apiV2ResponseMultiple));

    projectService.getByParamsUnformatted({}).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
      done();
    });
  });

  it('should be able to fetch data when params are provided', (done) => {
    apiV2Service.get.and.returnValue(of(apiV2ResponseMultiple));

    const result = projectService.getByParamsUnformatted(testProjectParams);

    result.subscribe((res) => {
      expect(res).toEqual(expectedProjectsResponse);
      done();
    });
  });

  it('should get allowed organisation category IDs | With project', () => {
    const result = projectService.getAllowedOrgCategoryIds(testProject, testActiveCategoryList);
    expect(result).toEqual(allowedActiveCategories);
  });

  it('should get allowed organisation category IDs | Without project', () => {
    const result = projectService.getAllowedOrgCategoryIds(null, testActiveCategoryList);
    expect(result).toEqual(testActiveCategoryList);
  });

  it('should get project count | with categoryID', (done) => {
    apiService.get.and.returnValue(of(apiResponseActiveOnly));

    const result = projectService.getProjectCount({ categoryIds: testCategoryIds });
    result.subscribe((res) => {
      expect(res).toEqual(2);
      done();
    });
  });

  it('should get project count | without category IDs', (done) => {
    apiService.get.and.returnValue(of(apiResponseActiveOnly));

    const result = projectService.getProjectCount();

    result.subscribe((res) => {
      expect(res).toEqual(apiResponseActiveOnly.length);
      done();
    });
  });

  it('should get project count | without category IDs', (done) => {
    apiService.get.and.returnValue(of(apiResponseActiveOnly));

    const result = projectService.getProjectCount({ categoryIds: null });

    result.subscribe((res) => {
      expect(res).toEqual(apiResponseActiveOnly.length);
      done();
    });
  });
});
