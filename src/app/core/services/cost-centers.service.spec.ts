import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { CostCentersService } from './cost-centers.service';
import { DateService } from './date.service';
import { of } from 'rxjs';
// import{costCentersDataSingle} from '../mock-data/platformCostCenter.data';

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
});
