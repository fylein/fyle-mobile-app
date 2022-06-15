import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ExtendedProject } from '../models/v2/extended-project.model';

import { ProjectsService } from './projects.service';

const apiResponseActiveOnly = [
  {
    id: 257528,
    created_at: '2021-05-12T10:28:40.834Z',
    updated_at: '2021-07-08T10:28:27.686Z',
    name: 'Customer Mapped Project',
    sub_project: null,
    code: '1184',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: [
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
  },
  {
    id: 257541,
    created_at: '2021-05-12T10:28:40.834Z',
    updated_at: '2021-07-08T10:28:27.686Z',
    name: 'Sage Project 8',
    sub_project: null,
    code: '1178',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Sage Project 8, Id - 1178',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: [
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
  },
  {
    id: 257531,
    created_at: '2021-05-12T10:28:40.834Z',
    updated_at: '2021-07-08T10:28:27.686Z',
    name: 'Fyle Team Integrations',
    sub_project: null,
    code: '1183',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Fyle Team Integrations, Id - 1183',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: [
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
  },
];

const apiV2ResponseMultiple = {
  count: 2,
  data: [
    {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1184',
      project_created_at: '2021-05-12T10:28:40.834844',
      project_description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      project_id: 257528,
      project_name: 'Customer Mapped Project',
      project_org_category_ids: [
        122269,
        122270,
        122271,
        122272,
        122273,
        122274,
        122275,
        122276,
        122277,
        122278,
        122279,
        122280,
        122281,
        122282,
        122283,
        null,
      ],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: '2021-07-08T10:28:27.686886',
      projectv2_name: 'Customer Mapped Project',
      sub_project_name: null,
    },
    {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1182',
      project_created_at: '2021-05-12T10:28:40.834844',
      project_description: 'Sage Intacct Project - Fyle Engineering, Id - 1182',
      project_id: 257529,
      project_name: 'Fyle Engineering',
      project_org_category_ids: [122269, 122270, 122271],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: '2021-07-08T10:28:27.686886',
      projectv2_name: 'Fyle Engineering',
      sub_project_name: null,
    },
  ],
  limit: 4,
  offset: 0,
  url: '/v2/projects',
};

const apiV2ResponseSingle = {
  count: 1,
  data: [
    {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1184',
      project_created_at: '2021-05-12T10:28:40.834844',
      project_description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      project_id: 257528,
      project_name: 'Customer Mapped Project',
      project_org_category_ids: [
        122269,
        122270,
        122271,
        122272,
        122273,
        122274,
        122275,
        122276,
        122277,
        122278,
        122279,
        122280,
        122281,
        122282,
        122283,
        null,
      ],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: '2021-07-08T10:28:27.686886',
      projectv2_name: 'Customer Mapped Project',
      sub_project_name: null,
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/projects',
};

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
    projectService.getbyId(257528, []).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseSingle.data)[0]);
      done();
    });

    expect(apiV2Service.get).toHaveBeenCalledWith('/projects', {
      params: {
        project_id: 'eq.257528',
      },
    });
  });

  // it('should be able to fetch all active projects', (done) => {
  //   apiService.get.and.returnValue(of(apiResponseActiveOnly));
  //   projectService.getAllActive().subscribe((res) => {
  //     expect(res).toEqual(apiResponseActiveOnly);
  //     done();
  //   });

  //   expect(apiService.get).toHaveBeenCalledWith('/projects', {
  //     params: {
  //       active_only: true,
  //     },
  //   });
  // });

  it('should be able to fetch data when no params provided', (done) => {
    apiV2Service.get.and.returnValue(of(apiV2ResponseMultiple));

    projectService.getByParamsUnformatted({}, []).subscribe((res) => {
      expect(res).toEqual(fixDate(apiV2ResponseMultiple.data));
      done();
    });
  });
});
