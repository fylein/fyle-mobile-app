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
} from '../test-data/projects.spec.data';
import { ProjectsService } from './projects.service';

const fixDate = (data) =>
  data.map((datum) => ({
    ...datum,
    project_created_at: new Date(datum.project_created_at),
    project_updated_at: new Date(datum.project_updated_at),
  }));

fdescribe('ProjectsService', () => {
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

    const testProjectParams = {
      orgId: 'orNVthTo2Zyo',
      active: true,
      sortDirection: 'asc',
      sortOrder: 'project_name',
      orgCategoryIds: [
        null,
        145429,
        122269,
        122271,
        122270,
        122273,
        122272,
        122275,
        122274,
        122277,
        122276,
        122279,
        122278,
        173093,
        122281,
        122280,
        122283,
        122282,
        122285,
        122284,
        122287,
        122286,
        122289,
        140530,
        145458,
        122288,
        140531,
        122291,
        122290,
        140529,
        122293,
        140534,
        122292,
        140535,
        140532,
        122294,
        140533,
        140538,
        140539,
        140536,
        140537,
        140542,
        140540,
        140541,
      ],
      projectIds: [3943, 305792, 148971, 247936],
      offset: 0,
      limit: 10,
      searchNameText: 'search',
    };

    const result = projectService.getByParamsUnformatted(testProjectParams);

    result.subscribe((res) => {
      expect(res).toEqual(expectedProjectsResponse);
      done();
    });
  });

  it('should get allowed organisation category IDs | With project', () => {
    const testProject = {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: null,
      project_created_at: '2020-06-26T05:32:00.174Z',
      project_description: null,
      project_id: 3943,
      project_name: 'Staging Project',
      project_org_category_ids: [
        16560, 16565, 51722, 52525, 52527, 54661, 58348, 58349, 74547, 89550, 115914, 115970, 117013, 123032, 195157,
        195158, 195863, 201934, 201935, 201936, 201937, 201938, 201939, 201940, 201941, 201942, 201943, 201944, 201945,
        201946, 201947, 201948, 201949, 201950, 201951, 201952, 201953, 201954, 201955, 201957, 201958, 201959, 201960,
        201963, 201964, 201965, 201966, 201967, 208461, 209219, 211023, 211024, 212017, 212374, 212526, 212527, 212528,
        212529, 212530, 212532, 212533, 212690, 212691, 212692, 213428, 213429, 224733, 224734,
      ],
      project_org_id: 'orNVthTo2Zyo',
      project_updated_at: '2022-11-23T08:55:29.400Z',
      projectv2_name: 'Staging Project',
      sub_project_name: null,
    };

    const result = projectService.getAllowedOrgCategoryIds(testProject, testActiveCategoryList);
    expect(result).toEqual(allowedActiveCategories);
  });

  it('should get allowed organisation category IDs | Without project', () => {
    const result = projectService.getAllowedOrgCategoryIds(null, testActiveCategoryList);
    expect(result).toEqual(testActiveCategoryList);
  });

  it('should get project count | with categoryID', (done) => {
    apiService.get.and.returnValue(of(apiResponseActiveOnly));
    const testParams = [
      '145429',
      '173093',
      '122285',
      '122284',
      '122287',
      '122286',
      '122289',
      '140530',
      '145458',
      '122288',
      '140531',
      '122291',
      '122290',
    ];
    const result = projectService.getProjectCount({ categoryIds: testParams });
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
