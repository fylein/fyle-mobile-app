import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';
import { expectedTxnCustomProperties, txnCustomPropertiesData } from '../mock-data/txn-custom-properties.data';
import { TimezoneService } from './timezone.service';
import { UtilityService } from './utility.service';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';

describe('TimezoneService', () => {
  let timezoneService: TimezoneService;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  beforeEach(() => {
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['traverse']);
    TestBed.configureTestingModule({
      providers: [
        TimezoneService,
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: UtilityService, useValue: utilityServiceSpy },
      ],
    });
    timezoneService = TestBed.inject(TimezoneService);
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
  });

  it('should be created', () => {
    expect(timezoneService).toBeTruthy();
  });

  describe('convertAllDatesToProperLocale(): ', () => {
    // TODO: change this test to proper reflect code behaviour once utility service has been refactored and fixed
    it('should convert all dates to proper locale', () => {
      const date = new Date('2023-02-13T17:00:00.000Z');
      const offset = '05:30:00';
      spyOn(timezoneService, 'convertToUtc').and.callThrough();
      utilityService.traverse.and.callFake((object, callback) => {
        callback(object);
        timezoneService.convertToUtc(date, offset);
        return expectedTxnCustomProperties;
      });

      const result = timezoneService.convertAllDatesToProperLocale(txnCustomPropertiesData, offset);
      expect(timezoneService.convertToUtc).toHaveBeenCalledOnceWith(date, offset);
      expect(result).toEqual(expectedTxnCustomProperties);
    });

    it('should return the data as it is if not a date instance', () => {
      const offset = '05:30:00';
      spyOn(timezoneService, 'convertToUtc').and.returnValue(new Date('2023-02-13T06:30:00.000Z'));

      utilityService.traverse.and.callFake((object, callback) => {
        const nonDateProp = txnCustomPropertiesData[0].value;
        return callback(nonDateProp);
      });

      const result = timezoneService.convertAllDatesToProperLocale([txnCustomPropertiesData[0]], offset);
      expect(result).toEqual([txnCustomPropertiesData[0]]);
    });
  });

  it('convertToTimezone(): should not modify the original date object', () => {
    const date = new Date('2023-03-22T12:00:00.000');
    const offset = '-05:30:00';
    const toUtc = true;
    const originalDate = new Date(date);
    timezoneService.convertToTimezone(date, offset, toUtc);
    expect(date).toEqual(originalDate);
  });

  it('convertToUtc(): should call convertToTimezone with the correct parameters', () => {
    const date = new Date('2022-01-01T00:00:00');
    const offset = '05:30:00';
    spyOn(timezoneService, 'convertToTimezone').and.returnValue(date);
    timezoneService.convertToUtc(date, offset);
    expect(timezoneService.convertToTimezone).toHaveBeenCalledOnceWith(date, offset, true);
  });
});
