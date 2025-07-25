import { TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';
import { MileageRatesService } from './mileage-rates.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import {
  filterEnabledMileageRatesData,
  platformMileageRatesData1,
  nullMileageRateData,
  mileageRateApiRes1,
  mileageRateApiRes2,
  unfilteredMileageRatesData2,
  expectedMileageData,
} from '../mock-data/mileage-rate.data';
import { platformMileageRates, platformMileageRatesSingleData } from '../mock-data/platform-mileage-rate.data';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import { cloneDeep } from 'lodash';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { TranslocoService } from '@jsverse/transloco';
describe('MileageRatesService', () => {
  let mileageRatesService: MileageRatesService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;
  let currencyPipe: jasmine.SpyObj<CurrencyPipe>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['get']);
    const currencyPipeSpy = jasmine.createSpyObj('CurrencyPipe', ['transform']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.mileageRates.twoWheeler': 'Two Wheeler',
        'services.mileageRates.fourWheelerType1': 'Four Wheeler - Type 1',
        'services.mileageRates.fourWheelerType2': 'Four Wheeler - Type 2',
        'services.mileageRates.fourWheelerType3': 'Four Wheeler - Type 3',
        'services.mileageRates.fourWheelerType4': 'Four Wheeler - Type 4',
        'services.mileageRates.bicycle': 'Bicycle',
        'services.mileageRates.electricCar': 'Electric Car',
        'services.mileageRates.mile': 'mile',
        'services.mileageRates.km': 'km',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        MileageRatesService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: ApproverPlatformApiService,
          useValue: approverPlatformApiServiceSpy,
        },
        {
          provide: CurrencyPipe,
          useValue: currencyPipeSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    mileageRatesService = TestBed.inject(MileageRatesService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService
    ) as jasmine.SpyObj<ApproverPlatformApiService>;

    currencyPipe = TestBed.inject(CurrencyPipe) as jasmine.SpyObj<CurrencyPipe>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
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
      const input = 'three_wheeler';
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
    const result = mileageRatesService.filterEnabledMileageRates(unfilteredMileageRatesData2);
    expect(result.length).toEqual(filterEnabledMileageRatesData.length);
    expect(result).toEqual(filterEnabledMileageRatesData);
  });

  it('excludeNullRates(): should exclude mileage rates with null rates', () => {
    const result = mileageRatesService.excludeNullRates(nullMileageRateData);
    expect(result.length).toEqual(platformMileageRatesData1.length);
    expect(result).toEqual(platformMileageRatesData1);
  });

  it('getMileageRates(): should get mileage rates', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformMileageRates));
    const data = {
      params: {
        offset: 0,
        limit: 4,
      },
    };
    spyOn(mileageRatesService, 'excludeNullRates').and.returnValue(cloneDeep(platformMileageRatesData1));
    mileageRatesService.getMileageRates({ offset: 0, limit: 4 }).subscribe((res) => {
      expect(res).toEqual(cloneDeep(platformMileageRatesData1));
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/mileage_rates', data);
      expect(mileageRatesService.excludeNullRates).toHaveBeenCalledOnceWith(platformMileageRates.data);
      done();
    });
  });

  it('getAllMileageRatesCount(): should get all mileage rates count', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformMileageRatesSingleData));
    const data = {
      params: {
        offset: 0,
        limit: 1,
      },
    };
    mileageRatesService.getAllMileageRatesCount().subscribe((res) => {
      expect(res).toEqual(platformMileageRatesSingleData.data.length);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/mileage_rates', data);
      done();
    });
  });

  it('getAllMileageRates(): should get all mileage rates', (done) => {
    const spyGetMileageRates = spyOn(mileageRatesService, 'getMileageRates');
    spyOn(mileageRatesService, 'getAllMileageRatesCount').and.returnValue(of(3));

    const testParams1 = { offset: 0, limit: 2 };
    spyGetMileageRates.withArgs(testParams1).and.returnValue(of(cloneDeep(mileageRateApiRes1)));

    const testParams2 = { offset: 2, limit: 2 };
    spyGetMileageRates.withArgs(testParams2).and.returnValue(of(cloneDeep(mileageRateApiRes2)));

    mileageRatesService.getAllMileageRates().subscribe((res) => {
      expect(res).toEqual(expectedMileageData);
      expect(spyGetMileageRates).toHaveBeenCalledTimes(2);
      expect(spyGetMileageRates).toHaveBeenCalledWith(testParams1);
      expect(spyGetMileageRates).toHaveBeenCalledWith(testParams2);
      done();
    });
  });

  it('getSpenderMileageRateById(): should get spender mileage rate by id', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformMileageRatesSingleData));
    const id = 1234;
    mileageRatesService.getSpenderMileageRateById(id).subscribe((response) => {
      expect(response).toEqual(platformMileageRatesSingleData.data[0]);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/mileage_rates', {
        params: {
          id: `eq.${id}`,
        },
      });
      done();
    });
  });

  it('getApproverMileageRateById(): should get approver mileage rate by id', (done) => {
    approverPlatformApiService.get.and.returnValue(of(platformMileageRatesSingleData));
    const id = 1234;
    mileageRatesService.getApproverMileageRateById(id).subscribe((response) => {
      expect(response).toEqual(platformMileageRatesSingleData.data[0]);
      expect(approverPlatformApiService.get).toHaveBeenCalledOnceWith('/mileage_rates', {
        params: {
          id: `eq.${id}`,
        },
      });
      done();
    });
  });
});
