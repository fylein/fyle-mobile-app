import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { CostCentersService } from './cost-centers.service';
import { of } from 'rxjs';
import { apiCostCenterSingleResponse, transformedCostCenterData } from '../mock-data/cost-centers.data';

const fixDate = (data) =>
  data.map((data) => ({
    ...data,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  }));

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

  it('getAllActive() : should return all active cost centers', () => {
    spenderPlatformApiService.get.and.returnValue(of(apiCostCenterSingleResponse));
    costCentersService.getAllActive().subscribe((costCenters) => {
      expect(costCenters).toEqual(fixDate(transformedCostCenterData));
      expect(spenderPlatformApiService.get).toHaveBeenCalledTimes(2);
    });
  });
});
