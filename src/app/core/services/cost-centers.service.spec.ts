import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { CostCentersService } from './cost-centers.service';
import { of } from 'rxjs';
import { platformCostCenterSingleRes, platformCostCenterMultipleRes } from '../mock-data/platform-cost-centers.data';
import { costCenterApiRes1, costCenterApiRes2, costCentersData } from '../mock-data/cost-centers.data';

describe('CostCentersService', () => {
  let costCentersService: CostCentersService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        CostCentersService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    costCentersService = TestBed.inject(CostCentersService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(costCentersService).toBeTruthy();
  });

  it('getActiveCostCentersCount(): should get active cost center count', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformCostCenterSingleRes));

    const params = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };

    costCentersService.getActiveCostCentersCount().subscribe((res) => {
      expect(res).toEqual(platformCostCenterSingleRes.count);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/cost_centers', params);
      done();
    });
  });

  it('getCostCenters(): should get cost centers as per config', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformCostCenterMultipleRes));
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 4,
      },
    };

    costCentersService.getCostCenters({ offset: 0, limit: 4 }).subscribe((res) => {
      expect(res).toEqual(platformCostCenterMultipleRes.data);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/cost_centers', data);
      done();
    });
  });

  it('getAllActive(): should return all active cost centers', () => {
    const spyGetCostCenters = spyOn(costCentersService, 'getCostCenters');

    const testParams2 = {
      offset: 0,
      limit: 2,
    };

    const testParams3 = {
      offset: 2,
      limit: 2,
    };

    spyOn(costCentersService, 'getActiveCostCentersCount').and.returnValue(of(3));
    spyGetCostCenters.withArgs(testParams2).and.returnValue(of(costCenterApiRes1));
    spyGetCostCenters.withArgs(testParams3).and.returnValue(of(costCenterApiRes2));

    costCentersService.getAllActive().subscribe((res) => {
      expect(res).toEqual(costCentersData);
      expect(costCentersService.getCostCenters).toHaveBeenCalledWith(testParams2);
      expect(costCentersService.getCostCenters).toHaveBeenCalledWith(testParams3);
      expect(costCentersService.getActiveCostCentersCount).toHaveBeenCalledTimes(1);
      expect(costCentersService.getCostCenters).toHaveBeenCalledTimes(2);
    });
  });
});
