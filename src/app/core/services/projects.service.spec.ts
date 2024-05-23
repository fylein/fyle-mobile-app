import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import {
  apiResponseActiveOnly,
  apiV2ResponseMultiple,
  expectedReponseActiveOnly,
  apiV2ResponseSingle,
  allowedActiveCategories,
  expectedProjectsResponse,
  testProjectParams,
  testProjectV2,
  testCategoryIds,
  params,
  testActiveCategoryList,
} from '../test-data/projects.spec.data';
import { ProjectsService } from './projects.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import {
  platformAPIResponseMultiple,
  platformProjectSingleRes,
  platformAPIResponseActiveOnly,
} from '../mock-data/platform/v1/platform-project.data';
import { ProjectPlatformParams } from '../mock-data/platform/v1/platform-projects-params.data';

const fixDate = (data) =>
  data.map((datum) => ({
    ...datum,
    project_created_at: new Date(datum.project_created_at),
    project_updated_at: new Date(datum.project_updated_at),
  }));

fdescribe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

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
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
      ],
    });
    projectsService = TestBed.inject(ProjectsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(projectsService).toBeTruthy();
  });

  it('should be able to fetch project by id with activeCategoryList', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformProjectSingleRes));

    spyOn(projectsService, 'transformToV2Response').and.returnValue([apiV2ResponseSingle.data[0]]);
    projectsService.getbyId(257528, testActiveCategoryList).subscribe((res) => {
      expect(res).toEqual(apiV2ResponseSingle.data[0]);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
        params: {
          id: 'eq.257528',
        },
      });
      expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
        platformProjectSingleRes.data,
        testActiveCategoryList
      );
      done();
    });
  });

  it('should be able to fetch project by id with null activeCategoryList', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformProjectSingleRes));

    spyOn(projectsService, 'transformToV2Response').and.returnValue([apiV2ResponseSingle.data[0]]);
    projectsService.getbyId(257528, null).subscribe((res) => {
      expect(res).toEqual(apiV2ResponseSingle.data[0]);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
        params: {
          id: 'eq.257528',
        },
      });
      expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(platformProjectSingleRes.data, null);
      done();
    });
  });

  it('should be able to fetch all active projects', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));
    spyOn(projectsService, 'transformToV1Response').and.returnValue(expectedReponseActiveOnly);

    projectsService.getAllActive(testActiveCategoryList).subscribe((res) => {
      expect(res).toEqual(expectedReponseActiveOnly);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
        params: {
          is_enabled: `eq.true`,
        },
      });
      expect(projectsService.transformToV1Response).toHaveBeenCalledOnceWith(
        platformAPIResponseActiveOnly.data,
        testActiveCategoryList
      );
      done();
    });
  });

  it('should be able to fetch all active projects with null activeCategoryList', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));
    spyOn(projectsService, 'transformToV1Response').and.returnValue(expectedReponseActiveOnly);

    projectsService.getAllActive(null).subscribe((res) => {
      expect(res).toEqual(expectedReponseActiveOnly);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
        params: {
          is_enabled: `eq.true`,
        },
      });
      expect(projectsService.transformToV1Response).toHaveBeenCalledOnceWith(platformAPIResponseActiveOnly.data, null);
      done();
    });
  });

  it('should be able to fetch data when no params provided and no activeCategoryList provided', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
    spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

    projectsService.getByParamsUnformatted({}, null).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
      expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(platformAPIResponseMultiple.data, null);
      done();
    });
  });

  it('should be able to fetch data when no params provided but activeCategoryList is provided', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
    spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

    projectsService.getByParamsUnformatted({}, testActiveCategoryList).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
      expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
        platformAPIResponseMultiple.data,
        testActiveCategoryList
      );
      done();
    });
  });

  it('should be able to fetch data when params are provided and no activeCategoryList is provided', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
    spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

    projectsService.getByParamsUnformatted(testProjectParams, null).subscribe((res) => {
      expect(res).toEqual(expectedProjectsResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
        params: ProjectPlatformParams,
      });
      expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(platformAPIResponseMultiple.data, null);
      done();
    });
  });

  it('should be able to fetch data when params and activeCategoryList are provided', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));

    spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

    projectsService.getByParamsUnformatted(testProjectParams, testActiveCategoryList).subscribe((res) => {
      expect(res).toEqual(expectedProjectsResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
        params: ProjectPlatformParams,
      });
      expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
        platformAPIResponseMultiple.data,
        testActiveCategoryList
      );
      done();
    });
  });

  it('should category list after filter as per project passed', () => {
    const result = projectsService.getAllowedOrgCategoryIds(testProjectV2, testActiveCategoryList);
    expect(result).toEqual(allowedActiveCategories);
  });

  it('should return whole category list if project passed is not present', () => {
    const result = projectsService.getAllowedOrgCategoryIds(null, testActiveCategoryList);
    expect(result).toEqual(testActiveCategoryList);
  });

  it('should get project count restricted by a set of category IDs', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));

    const result = projectsService.getProjectCount({ categoryIds: testCategoryIds });
    result.subscribe((res) => {
      expect(res).toEqual(2);
      done();
    });
  });

  it('should get project count restricted by a set of category IDs and activeCategoryList', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));

    projectsService.getProjectCount({ categoryIds: testCategoryIds }, testActiveCategoryList).subscribe((res) => {
      expect(res).toEqual(2);
      done();
    });
  });

  it('should get project count not restricted by a set of category IDs', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));

    const resultWithOutParam = projectsService.getProjectCount();
    const resultWithParam = projectsService.getProjectCount({ categoryIds: null });

    resultWithOutParam.subscribe((res) => {
      expect(res).toEqual(apiResponseActiveOnly.length);
    });
    resultWithParam.subscribe((res) => {
      expect(res).toEqual(apiResponseActiveOnly.length);
    });
    done();
  });
});
