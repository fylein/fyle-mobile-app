import { TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';
import { MileageRatesService } from './mileage-rates.service';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
import {
  filterEnabledMileageRatesData,
  unfilterdMileageRatesData,
  nullRateExcludedData1,
  nullRateIncludedData,
  mileageRateApiRes1,
  mileageRateApiRes2,
  nullRateExcludedData2,
} from '../mock-data/mileage-rate.data';
import { platformMileageRates, platformMileageRatesSingleData } from '../mock-data/platform-mileage-rate.data';
import { of } from 'rxjs';

describe('MileageRatesService', () => {
  let mileageRatesService: MileageRatesService;
  let spenderPlatformV1BetaApiService: jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
  let currencyPipe: jasmine.SpyObj<CurrencyPipe>;

  beforeEach(() => {
    const spenderPlatformV1BetaApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1BetaApiService', ['get']);
    const currencyPipeSpy = jasmine.createSpyObj('CurrencyPipe', ['transform']);

    TestBed.configureTestingModule({
      providers: [
        MileageRatesService,
        {
          provide: SpenderPlatformV1BetaApiService,
          useValue: spenderPlatformV1BetaApiServiceSpy,
        },
        {
          provide: CurrencyPipe,
          useValue: currencyPipeSpy,
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

  describe('formatMileageRateName()', () => {
    it('should give the formated mileage rate name', () => {
      const input = 'four_wheeler';
      const output = mileageRatesService.formatMileageRateName(input);
      expect(output).toEqual('Four Wheeler - Type 1');
    });

    it('should return the input string if it is not a valid rate name', () => {
      const input = 'invalid_rate_name';
      const output = mileageRatesService.formatMileageRateName(input);
      expect(output).toEqual(input);
    });

    it('should return an empty string if the input string is falsy', () => {
      const input = '';
      const output = mileageRatesService.formatMileageRateName(input);
      expect(output).toEqual('');
    });
  });

  describe('getReadableRate():', () => {
    it('should format a rate with currency and unit as km', () => {
      const rate = 1234.56;
      const currency = 'USD';
      const unit = 'km';
      const expectedOutput = '$1,234.56/km';

      currencyPipe.transform.and.returnValue('$1,234.56');
      const output = mileageRatesService.getReadableRate(rate, currency, unit);
      expect(currencyPipe.transform).toHaveBeenCalledOnceWith(rate, currency, 'symbol', '1.2-2');
      expect(output).toEqual(expectedOutput);
    });

    it('should format a rate with currency and unit as miles', () => {
      const rate = 10.5;
      const currency = 'USD';
      const unit = 'miles';
      const expectedResult = '$10.50/mile';
      currencyPipe.transform.and.returnValue('$10.50');
      const result = mileageRatesService.getReadableRate(rate, currency, unit);
      expect(currencyPipe.transform).toHaveBeenCalledOnceWith(rate, currency, 'symbol', '1.2-2');
      expect(result).toEqual(expectedResult);
    });
  });

  it('filterEnabledMileageRates(): should retutn enabled mileage rates', () => {
    const result = mileageRatesService.filterEnabledMileageRates(unfilterdMileageRatesData);
    expect(result.length).toEqual(filterEnabledMileageRatesData.length);
    expect(result).toEqual(filterEnabledMileageRatesData);
  });

  it('excludeNullRates(): should exclude mileage rates with null rates', () => {
    const result = mileageRatesService.excludeNullRates(nullRateIncludedData);
    expect(result.length).toEqual(nullRateExcludedData1.length);
    expect(result).toEqual(nullRateExcludedData1);
  });

  it('should get mileage rates', (done) => {
    spenderPlatformV1BetaApiService.get.and.returnValue(of(platformMileageRates));
    const data = {
      params: {
        offset: 0,
        limit: 4,
      },
    };
    spyOn(mileageRatesService, 'excludeNullRates').and.returnValue(nullRateExcludedData1);
    mileageRatesService.getMileageRates({ offset: 0, limit: 4 }).subscribe((res) => {
      expect(res).toEqual(nullRateExcludedData1);
      expect(spenderPlatformV1BetaApiService.get).toHaveBeenCalledOnceWith('/mileage_rates', data);
      expect(mileageRatesService.excludeNullRates).toHaveBeenCalledOnceWith(platformMileageRates.data);
      done();
    });
  });

  it('getAllMileageRatesCount(): should get all mileage rates count', (done) => {
    spenderPlatformV1BetaApiService.get.and.returnValue(of(platformMileageRatesSingleData));
    const data = {
      params: {
        offset: 0,
        limit: 1,
      },
    };
    mileageRatesService.getAllMileageRatesCount().subscribe((res) => {
      expect(res).toEqual(platformMileageRatesSingleData.data.length);
      expect(spenderPlatformV1BetaApiService.get).toHaveBeenCalledOnceWith('/mileage_rates', data);
      done();
    });
  });

  it('getAllMileageRates(): should get all mileage rates', (done) => {
    const spyGetMileageRates = spyOn(mileageRatesService, 'getMileageRates');
    spyOn(mileageRatesService, 'getAllMileageRatesCount').and.returnValue(of(100));

    // simulate first page of 50 mileage rates
    const testParams1 = { offset: 0, limit: 50 };
    spyGetMileageRates.withArgs(testParams1).and.returnValue(of(mileageRateApiRes1));

    // simulate second page of 50 mileage rates
    const testParams2 = { offset: 50, limit: 50 };
    spyGetMileageRates.withArgs(testParams2).and.returnValue(of(mileageRateApiRes2));

    mileageRatesService.getAllMileageRates().subscribe((res) => {
      expect(res).toEqual([...nullRateExcludedData1, ...nullRateExcludedData2]);
      expect(spyGetMileageRates).toHaveBeenCalledTimes(2);
      expect(spyGetMileageRates).toHaveBeenCalledWith(testParams1);
      expect(spyGetMileageRates).toHaveBeenCalledWith(testParams2);
      done();
    });
  });
});
