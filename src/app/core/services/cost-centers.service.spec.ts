import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { CostCentersService } from './cost-centers.service';
import { DateService } from './date.service';
import { of } from 'rxjs';
import { apiCostCenterSingleResponse, apiCostCenterMultipleResponse } from '../mock-data/platformCostCenter.data';
import { transformedCostCenterData } from '../mock-data/cost-centers.data';

describe('CostCentersService', () => {
  let costCentersService: CostCentersService;
  let spenderPlatformApiService: jasmine.SpyObj<SpenderPlatformApiService>;
  let dateService: jasmine.SpyObj<DateService>;

  beforeEach(() => {
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformApiService', ['get']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['fixDates', 'fixDatesV2']);
    TestBed.configureTestingModule({
      providers: [
        CostCentersService,
        {
          provide: SpenderPlatformApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    costCentersService = TestBed.inject(CostCentersService);
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
  });

  it('should be created', () => {
    expect(costCentersService).toBeTruthy();
  });

  it('getActiveCostCentersCount() : should get active cost center count', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(apiCostCenterSingleResponse));

    const params = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };

    costCentersService.getActiveCostCentersCount().subscribe((res) => {
      expect(res).toEqual(1);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/cost_centers', params);
      done();
    });
  });

  it('getCostCenters() : should get cost centers as per config', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(apiCostCenterMultipleResponse));

    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 200,
      },
    };

    costCentersService.getCostCenters({ offset: 0, limit: 200 }).subscribe((res) => {
      expect(res).toEqual(transformedCostCenterData);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/cost_centers', data);
      done();
    });
  });

  it('getAllActive() : should return all active cost centers', () => {
    const spyGetActiveCostCentersCount = spyOn(costCentersService, 'getActiveCostCentersCount').and.returnValue(of(3));
    const spyGetCostCenters = spyOn(costCentersService, 'getCostCenters').and.returnValue(
      of(transformedCostCenterData)
    );
    costCentersService.getAllActive().subscribe((res) => {
      //  expect(res).toEqual(transformedCostCenterData);
      expect(spyGetCostCenters).toHaveBeenCalledTimes(2);
      expect(spyGetActiveCostCentersCount).toHaveBeenCalledTimes(1);
    });
  });
});
