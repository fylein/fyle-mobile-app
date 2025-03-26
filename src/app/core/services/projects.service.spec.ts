import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
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
  testActiveCategoryList,
  projectsV1Data,
  expectedV2WithAllCategories,
} from '../test-data/projects.spec.data';
import { ProjectsService } from './projects.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import {
  platformAPIResponseMultiple,
  platformProjectSingleRes,
  platformAPIResponseActiveOnly,
  platformAPIResponseNullCategories,
} from '../mock-data/platform/v1/platform-project.data';
import { ProjectPlatformParams } from '../mock-data/platform/v1/platform-projects-params.data';
import { cloneDeep } from 'lodash';

const fixDate = (data) =>
  data.map((datum) => ({
    ...datum,
    project_created_at: new Date(datum.project_created_at),
    project_updated_at: new Date(datum.project_updated_at),
  }));

describe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
      ],
    });
    projectsService = TestBed.inject(ProjectsService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(projectsService).toBeTruthy();
  });

  describe('getbyId():', () => {
    it('should be able to fetch project by id with activeCategoryList', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformProjectSingleRes));

      spyOn(projectsService, 'transformToV2Response').and.returnValue([apiV2ResponseSingle.data[0]]);
      projectsService.getbyId(257528, testActiveCategoryList).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: {
            id: 'eq.257528',
          },
        });
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
          platformProjectSingleRes.data,
          testActiveCategoryList
        );
        expect(res).toEqual(apiV2ResponseSingle.data[0]);
        done();
      });
    });

    it('should be able to fetch project by id with null activeCategoryList', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformProjectSingleRes));

      spyOn(projectsService, 'transformToV2Response').and.returnValue([apiV2ResponseSingle.data[0]]);
      projectsService.getbyId(257528, null).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: {
            id: 'eq.257528',
          },
        });
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(platformProjectSingleRes.data, null);
        expect(res).toEqual(apiV2ResponseSingle.data[0]);
        done();
      });
    });

    it('should be able to fetch project by id and activeCategoryList is not provided', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformProjectSingleRes));

      spyOn(projectsService, 'transformToV2Response').and.returnValue([apiV2ResponseSingle.data[0]]);
      projectsService.getbyId(257528).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: {
            id: 'eq.257528',
          },
        });
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
          platformProjectSingleRes.data,
          undefined
        );
        expect(res).toEqual(apiV2ResponseSingle.data[0]);
        done();
      });
    });
  });

  describe('getAllActive():', () => {
    it('should be able to fetch all active projects', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));
      spyOn(projectsService, 'transformToV1Response').and.returnValue(expectedReponseActiveOnly);

      projectsService.getAllActive(testActiveCategoryList).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: {
            is_enabled: `eq.true`,
          },
        });
        expect(projectsService.transformToV1Response).toHaveBeenCalledOnceWith(
          platformAPIResponseActiveOnly.data,
          testActiveCategoryList
        );
        expect(res).toEqual(expectedReponseActiveOnly);
        done();
      });
    });

    it('should be able to fetch all active projects with null activeCategoryList', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));
      spyOn(projectsService, 'transformToV1Response').and.returnValue(expectedReponseActiveOnly);

      projectsService.getAllActive(null).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: {
            is_enabled: `eq.true`,
          },
        });
        expect(projectsService.transformToV1Response).toHaveBeenCalledOnceWith(
          platformAPIResponseActiveOnly.data,
          null
        );
        expect(res).toEqual(expectedReponseActiveOnly);
        done();
      });
    });

    it('should be able to fetch all active projects with activeCategoryList not provided', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));
      spyOn(projectsService, 'transformToV1Response').and.returnValue(expectedReponseActiveOnly);

      projectsService.getAllActive().subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: {
            is_enabled: `eq.true`,
          },
        });
        expect(projectsService.transformToV1Response).toHaveBeenCalledOnceWith(
          platformAPIResponseActiveOnly.data,
          undefined
        );
        expect(res).toEqual(expectedReponseActiveOnly);
        done();
      });
    });
  });

  describe('getByParamsUnformatted():', () => {
    it('should be able to fetch data when no params provided and activeCategoryList not provided', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
      spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

      projectsService.getByParamsUnformatted({}, true).subscribe((res) => {
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
          platformAPIResponseMultiple.data,
          undefined
        );
        expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
        done();
      });
    });

    it('should be able to fetch data when no params provided but activeCategoryList is provided', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
      spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

      projectsService.getByParamsUnformatted({}, true, testActiveCategoryList).subscribe((res) => {
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
          platformAPIResponseMultiple.data,
          testActiveCategoryList
        );
        expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
        done();
      });
    });

    it('should be able to fetch the data when there no params are provided and activeCategoryList is null', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
      spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

      projectsService.getByParamsUnformatted({}, true, null).subscribe((res) => {
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(platformAPIResponseMultiple.data, null);
        expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
        done();
      });
    });

    it('should be able to fetch data when params are provided and null activeCategoryList is provided', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
      spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

      projectsService.getByParamsUnformatted(testProjectParams, true, null).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: ProjectPlatformParams,
        });
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(platformAPIResponseMultiple.data, null);
        expect(res).toEqual(expectedProjectsResponse);
        done();
      });
    });

    it('should be able to fetch data when params are provided and no activeCategoryList is provided', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
      spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

      projectsService.getByParamsUnformatted(testProjectParams, true).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: ProjectPlatformParams,
        });
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
          platformAPIResponseMultiple.data,
          undefined
        );
        expect(res).toEqual(expectedProjectsResponse);
        done();
      });
    });

    it('should be able to fetch data when params and activeCategoryList are provided', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
      spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);

      projectsService.getByParamsUnformatted(testProjectParams, true, testActiveCategoryList).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: ProjectPlatformParams,
        });
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
          platformAPIResponseMultiple.data,
          testActiveCategoryList
        );
        expect(res).toEqual(expectedProjectsResponse);
        done();
      });
    });

    it('should not pass any or param of category_ids when activeCategoryList are provided and isProjectCategoryRestrictionsEnabled is false', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseMultiple));
      spyOn(projectsService, 'transformToV2Response').and.returnValue(expectedProjectsResponse);
      const expectedParams = cloneDeep(ProjectPlatformParams);
      delete expectedParams.or;

      projectsService.getByParamsUnformatted(testProjectParams, false, testActiveCategoryList).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/projects', {
          params: expectedParams,
        });
        expect(projectsService.transformToV2Response).toHaveBeenCalledOnceWith(
          platformAPIResponseMultiple.data,
          testActiveCategoryList
        );
        expect(res).toEqual(expectedProjectsResponse);
        done();
      });
    });
  });

  describe('getAllowedOrgCategoryIds():', () => {
    it('should return category list after filter as per project passed and if isProjectCategoryRestrictionsEnabled is true', () => {
      const result = projectsService.getAllowedOrgCategoryIds(testProjectV2, testActiveCategoryList, true);
      expect(result).toEqual(allowedActiveCategories);
    });

    it('should return whole category list if project passed is restricted but isProjectCategoryRestrictionsEnabled is false', () => {
      const result = projectsService.getAllowedOrgCategoryIds(testProjectV2, testActiveCategoryList, false);
      expect(result).toEqual(testActiveCategoryList);
    });

    it('should return whole category list if project passed is not present', () => {
      const result = projectsService.getAllowedOrgCategoryIds(null, testActiveCategoryList, true);
      expect(result).toEqual(testActiveCategoryList);
    });
  });

  describe('getProjectCount():', () => {
    it('should get project count restricted by a set of category IDs and null activeCategoryList', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));

      projectsService.getProjectCount({ categoryIds: testCategoryIds }, null).subscribe((res) => {
        expect(res).toEqual(2);
        done();
      });
    });

    it('should get project count restricted by a set of category IDs and activeCategoryList not provided', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));

      projectsService.getProjectCount({ categoryIds: testCategoryIds }).subscribe((res) => {
        expect(res).toEqual(2);
        done();
      });
    });

    it('should get project count restricted by a set of category IDs and activeCategoryList', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));
      spyOn(projectsService, 'getAllActive').and.returnValue(of(expectedReponseActiveOnly));

      projectsService.getProjectCount({ categoryIds: testCategoryIds }, testActiveCategoryList).subscribe((res) => {
        expect(projectsService.getAllActive).toHaveBeenCalledOnceWith(testActiveCategoryList);
        expect(res).toEqual(2);
        done();
      });
    });

    it('should get project count not restricted by a set of category IDs', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformAPIResponseActiveOnly));
      spyOn(projectsService, 'getAllActive').and.returnValue(of(expectedReponseActiveOnly));

      const resultWithOutParam = projectsService.getProjectCount();
      const resultWithParam = projectsService.getProjectCount({ categoryIds: null });

      resultWithOutParam.subscribe((res) => {
        expect(res).toEqual(apiResponseActiveOnly.length);
      });
      resultWithParam.subscribe((res) => {
        expect(res).toEqual(apiResponseActiveOnly.length);
      });
      expect(projectsService.getAllActive).toHaveBeenCalledWith(undefined);
      done();
    });
  });

  describe('transformToV1Response():', () => {
    it('should correctly transform platformProject to ProjectV1 with activeCategoryList provided', () => {
      const result = projectsService.transformToV1Response(platformAPIResponseMultiple.data, testActiveCategoryList);
      expect(result).toEqual(projectsV1Data);
    });

    it('should correctly transform platformProject to ProjectV1 with activeCategoryList is null', () => {
      const result = projectsService.transformToV1Response(platformAPIResponseMultiple.data, null);
      expect(result).toEqual(projectsV1Data);
    });

    it('should correctly transform platformProject to ProjectV1 with activeCategoryList is not provided', () => {
      const result = projectsService.transformToV1Response(platformAPIResponseMultiple.data);
      expect(result).toEqual(projectsV1Data);
    });
  });

  describe('transformToV2Response():', () => {
    it('should correctly transform platformProject to ProjectV2 with activeCategoryList provided', () => {
      const result = projectsService.transformToV2Response(platformAPIResponseMultiple.data, testActiveCategoryList);
      expect(result).toEqual(expectedProjectsResponse);
    });

    it('should correctly transform platformProject to ProjectV2 with activeCategoryList is null', () => {
      const result = projectsService.transformToV2Response(platformAPIResponseMultiple.data, null);
      expect(result).toEqual(expectedProjectsResponse);
    });

    it('should correctly transform platformProject to ProjectV2 with activeCategoryList is not provided', () => {
      const result = projectsService.transformToV2Response(platformAPIResponseMultiple.data);
      expect(result).toEqual(expectedProjectsResponse);
    });

    it('should handle platformProject with category_ids as null', () => {
      const result = projectsService.transformToV2Response(
        platformAPIResponseNullCategories.data,
        testActiveCategoryList
      );
      expect(result).toEqual(expectedV2WithAllCategories);
    });
  });
});
