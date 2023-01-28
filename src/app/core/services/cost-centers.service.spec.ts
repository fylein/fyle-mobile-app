import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { CostCentersService } from './cost-centers.service';
import { of } from 'rxjs';
import {
  apiCostCenterSingleResponse,
  apiCostServiceFirst,
  apiCostserviceSecond,
  ActiveCostCenter,
} from '../mock-data/cost-centers.data';

describe('CostCentersService', () => {
  let costCentersService: CostCentersService;
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
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    costCentersService = TestBed.inject(CostCentersService);
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
  });

  it('should be created', () => {
    expect(costCentersService).toBeTruthy();
  });

  it('should get all active cost centers', (done) => {
    const testParams1 = {
      params: {
        is_enabled: 'eq.true',
        offset: 0,
        limit: 1,
      },
    };
    const testParams2 = {
      params: {
        is_enabled: 'eq.true',
        offset: 0,
        limit: 2,
      },
    };

    const testParams3 = {
      params: {
        is_enabled: 'eq.true',
        offset: 2,
        limit: 2,
      },
    };
    spenderPlatformApiService.get
      .withArgs('/cost_centers', testParams1)
      .and.returnValue(of(apiCostCenterSingleResponse));
    spenderPlatformApiService.get.withArgs('/cost_centers', testParams2).and.returnValue(of(apiCostServiceFirst));
    spenderPlatformApiService.get.withArgs('/cost_centers', testParams3).and.returnValue(of(apiCostserviceSecond));

    costCentersService.getAllActive().subscribe(() => {
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/cost_centers', testParams1);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/cost_centers', testParams2);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/cost_centers', testParams3);
      done();
    });
  });

  it('should get active cost centers count', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(apiCostCenterSingleResponse));

    const params = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };

    costCentersService.getActiveCostCentersCount().subscribe((res) => {
      expect(res).toEqual(4);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/cost_centers', params);
      done();
    });
  });

  it('should get cost centers as per config', () => {
    spenderPlatformApiService.get.and.returnValue(of(ActiveCostCenter));
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 4,
      },
    };

    costCentersService.getCostCenters({ offset: 0, limit: 4 }).subscribe(() => {
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/cost_centers', data);
    });
  });
});
