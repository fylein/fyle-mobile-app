import { TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';
import { MileageRatesService } from './mileage-rates.service';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
import { PAGINATION_SIZE } from 'src/app/constants';
import { filterEnabledMileageRatesData, mileageRatesData } from '../mock-data/mileage-rate.data';

describe('MileageRatesService', () => {
  let mileageRatesService: MileageRatesService;
  let spenderPlatformV1BetaApiService: jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
  let currencyPipe: jasmine.SpyObj<CurrencyPipe>;

  beforeEach(() => {
    const spenderPlatformV1BetaApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1BetaApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        MileageRatesService,
        {
          provide: SpenderPlatformV1BetaApiService,
          useValue: spenderPlatformV1BetaApiServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
        {
          provide: CurrencyPipe,
          useValue: currencyPipe,
        },
      ],
    });
    mileageRatesService = TestBed.inject(MileageRatesService);
    spenderPlatformV1BetaApiService = TestBed.inject(
      SpenderPlatformV1BetaApiService
    ) as jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
    currencyPipe = TestBed.inject(CurrencyPipe) as jasmine.SpyObj<CurrencyPipe>;
  });

  it('should be created', () => {
    expect(mileageRatesService).toBeTruthy();
  });

  it('filterEnabledMileageRates(): should retutn enabled mileage rates', () => {
    const result = mileageRatesService.filterEnabledMileageRates(mileageRatesData);
    expect(result.length).toEqual(filterEnabledMileageRatesData.length);
    expect(result).toEqual(filterEnabledMileageRatesData);
  });
});
