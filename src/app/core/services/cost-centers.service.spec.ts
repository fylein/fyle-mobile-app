import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CostCentersService } from './cost-centers.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';

const costcenterPlatformResponse = {
  count: 2,
  data: [
    {
      code: null,
      created_at: '2022-05-03T18:59:48.523338+00:00',
      description: null,
      id: 9559,
      is_enabled: true,
      name: 'CC 1',
      org_id: 'or93PFNglpOz',
      updated_at: '2022-05-03T18:59:48.523338+00:00',
    },
    {
      code: null,
      created_at: '2022-05-03T19:01:21.414913+00:00',
      description: null,
      id: 9560,
      is_enabled: true,
      name: 'CC 2',
      org_id: 'or93PFNglpOz',
      updated_at: '2022-05-03T19:01:21.414913+00:00',
    },
  ],
  offset: 0,
};

const transformedCostCenterData = [
  {
    code: null,
    created_at: new Date('2022-05-03T18:59:48.523338+00:00'),
    description: null,
    id: 9559,
    active: true,
    name: 'CC 1',
    org_id: 'or93PFNglpOz',
    updated_at: new Date('2022-05-03T18:59:48.523338+00:00'),
  },
  {
    code: null,
    created_at: new Date('2022-05-03T19:01:21.414913+00:00'),
    description: null,
    id: 9560,
    active: true,
    name: 'CC 2',
    org_id: 'or93PFNglpOz',
    updated_at: new Date('2022-05-03T19:01:21.414913+00:00'),
  },
];

describe('CostCentersService', () => {
  let costCenterService: CostCentersService;
  let spenderPlatformApiService: jasmine.SpyObj<SpenderPlatformApiService>;

  beforeEach(() => {
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        CostCentersService,
        {
          provide: SpenderPlatformApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
      ],
    });
    costCenterService = TestBed.inject(CostCentersService);
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
  });

  it('should be created', () => {
    expect(costCenterService).toBeTruthy();
  });

  fit('should return proper response from api and transform it into proper model', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(costcenterPlatformResponse));

    costCenterService.getAllActive().subscribe((costCenters) => {
      expect(costCenters).toEqual(transformedCostCenterData);
      done();
    });
  });
});
