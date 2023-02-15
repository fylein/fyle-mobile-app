import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
import { CostCentersService } from './cost-centers.service';
import { of } from 'rxjs';
import { apiCostCenterSingleResponse, apiCostCenterMultipleResponse } from '../mock-data/platformCostCenter.data';
import { costCenterApiRes1, costCenterApiRes2, costCentersData } from '../mock-data/cost-centers.data';

describe('CostCentersService', () => {
  let costCentersService: CostCentersService;
  let spenderPlatformV1BetaApiService: jasmine.SpyObj<SpenderPlatformV1BetaApiService>;

  beforeEach(() => {
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1BetaApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        CostCentersService,
        {
          provide: SpenderPlatformV1BetaApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    costCentersService = TestBed.inject(CostCentersService);
    spenderPlatformV1BetaApiService = TestBed.inject(
      SpenderPlatformV1BetaApiService
    ) as jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
  });

  it('should be created', () => {
    expect(costCentersService).toBeTruthy();
  });

  it('getActiveCostCentersCount(): should get active cost center count', (done) => {
    spenderPlatformV1BetaApiService.get.and.returnValue(of(apiCostCenterSingleResponse));

    const params = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };

    costCentersService.getActiveCostCentersCount().subscribe((res) => {
      expect(res).toEqual(apiCostCenterSingleResponse.count);
      expect(spenderPlatformV1BetaApiService.get).toHaveBeenCalledWith('/cost_centers', params);
      done();
    });
  });

  it('getCostCenters(): should get cost centers as per config', (done) => {
    spenderPlatformV1BetaApiService.get.and.returnValue(of(apiCostCenterMultipleResponse));
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 4,
      },
    };

    spyOn(costCentersService, 'transformFrom').and.returnValue(costCentersData);
    costCentersService.getCostCenters({ offset: 0, limit: 4 }).subscribe((res) => {
      expect(res).toEqual(costCentersData);
      expect(spenderPlatformV1BetaApiService.get).toHaveBeenCalledOnceWith('/cost_centers', data);
      expect(costCentersService.transformFrom).toHaveBeenCalledOnceWith(apiCostCenterMultipleResponse.data);
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

  it('transformFrom(): should transform all the data', () => {
    const transformResult = costCentersService.transformFrom(apiCostCenterMultipleResponse.data);
    expect(transformResult).toEqual(costCentersData);
  });
});
