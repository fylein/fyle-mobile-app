import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import {
  apiResponseActiveOnly,
  apiV2ResponseMultiple,
  expectedReponseActiveOnly,
  apiV2ResponseSingle,
  testActiveCategoryList,
  allowedActiveCategories,
  expectedProjectsResponse,
  testProjectParams,
  testProjectV2,
  testCategoryIds,
  params,
} from '../test-data/projects.spec.data';
import { ProjectsService } from './projects.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import {
  platformAPIResponseMultiple,
  platformProjectSingleRes,
  platformAPIResponseActiveOnly,
} from '../mock-data/platform/v1/platform-project.data';
import { ProjectPlatformParams } from '../mock-data/platform/v1/platform-projects-params.data';
import { CategoriesService } from './categories.service';
import { orgCategoryPaginated1 } from '../mock-data/org-category.data';
import { OrgCategory } from '../models/v1/org-category.model';

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
  let categoriesService: jasmine.SpyObj<CategoriesService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getAll']);

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
        {
          provide: CategoriesService,
          useValue: categoriesServiceSpy,
        },
      ],
    });
    projectsService = TestBed.inject(ProjectsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
  });

  it('should be created', () => {
    expect(projectsService).toBeTruthy();
  });

  it('should be able to fetch project by id', fakeAsync(() => {
    categoriesService.getAll.and.returnValue(of(orgCategoryPaginated1));
    spenderPlatformV1ApiService.get.and.returnValue(of(platformProjectSingleRes));

    let activeCategories: OrgCategory[];
    categoriesService.getAll().subscribe((categories) => {
      activeCategories = categories;
    });
    tick();

    spyOn(projectsService, 'transformToV2Response').and.returnValue([apiV2ResponseSingle.data[0]]);
    projectsService.getbyId(257528, activeCategories).subscribe((res) => {
      expect(res).toEqual(apiV2ResponseSingle.data[0]);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
        params: {
          id: 'eq.257528',
        },
      });
      expect(projectsService.transformToV2Response).toHaveBeenCalled();
    });

    discardPeriodicTasks();
  }));

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
      expect(projectsService.transformToV2Response).toHaveBeenCalled();
      done();
    });
  });

  it('should be able to fetch all active projects', fakeAsync(() => {
    categoriesService.getAll.and.returnValue(of(orgCategoryPaginated1));
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));
    spyOn(projectsService, 'transformToV1Response').and.returnValue(expectedReponseActiveOnly);

    let activeCategories: OrgCategory[];
    categoriesService.getAll().subscribe((categories) => {
      activeCategories = categories;
    });
    tick();

    projectsService.getAllActive(activeCategories).subscribe((res) => {
      expect(res).toEqual(expectedReponseActiveOnly);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
        params: {
          is_enabled: `eq.true`,
        },
      });
      expect(projectsService.transformToV1Response).toHaveBeenCalled();
    });

    discardPeriodicTasks();
  }));

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
      expect(projectsService.transformToV1Response).toHaveBeenCalled();
      done();
    });
  });

  it('should be able to fetch data when no params provided', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));

    projectsService.getByParamsUnformatted({}).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
      done();
    });
  });

  it('should be able to fetch data when no params provided and no activeCategoryList provided', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
    projectsService.getByParamsUnformatted({}, null).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
      done();
    });
  });

  it('should be able to fetch data when no params provided but activeCategoryList is provided', fakeAsync(() => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
    categoriesService.getAll.and.returnValue(of(orgCategoryPaginated1));

    let activeCategories: OrgCategory[];
    categoriesService.getAll().subscribe((categories) => {
      activeCategories = categories;
    });
    tick();

    projectsService.getByParamsUnformatted({}, activeCategories).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
    });

    discardPeriodicTasks();
  }));

  it('should be able to fetch data when params are provided and no activeCategoryList is provided', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
    const params = ProjectPlatformParams;
    const result = projectsService.getByParamsUnformatted(testProjectParams, null);
    spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

    result.subscribe((res) => {
      expect(res).toEqual(expectedProjectsResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledWith('/projects', {
        params,
      });
      expect(projectsService.transformToV2Response).toHaveBeenCalled();
      done();
    });
  });

  it('should be able to fetch data when params and activeCategoryList are provided', fakeAsync(() => {
    categoriesService.getAll.and.returnValue(of(orgCategoryPaginated1));
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
    const params = ProjectPlatformParams;

    let activeCategories: OrgCategory[];
    categoriesService.getAll().subscribe((categories) => {
      activeCategories = categories;
    });
    tick();

    const result = projectsService.getByParamsUnformatted(testProjectParams, activeCategories);
    spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

    result.subscribe((res) => {
      expect(res).toEqual(expectedProjectsResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledWith('/projects', {
        params,
      });
      expect(projectsService.transformToV2Response).toHaveBeenCalled();
    });

    discardPeriodicTasks();
  }));

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

  it('should get project count restricted by a set of category IDs and activeCategoryList', fakeAsync(() => {
    categoriesService.getAll.and.returnValue(of(orgCategoryPaginated1));
    spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));

    let activeCategories: OrgCategory[];
    categoriesService.getAll().subscribe((categories) => {
      activeCategories = categories;
    });
    tick();

    const result = projectsService.getProjectCount({ categoryIds: testCategoryIds }, activeCategories);
    result.subscribe((res) => {
      expect(res).toEqual(2);
    });
    discardPeriodicTasks();
  }));

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
