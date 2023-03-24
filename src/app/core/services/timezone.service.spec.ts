import { TestBed } from '@angular/core/testing';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';
import { CurrencyService } from './currency.service';

import { TimezoneService } from './timezone.service';
import { UtilityService } from './utility.service';

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
    it('should convert all dates to proper locale', () => {
      utilityService.traverse.and.callFake((object, callback) => {
        const date = new Date('2023-02-13T17:00:00.000Z');
        date.setHours(12);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return callback(date);
      });

      const data: TxnCustomProperties[] = [
        {
          id: 206198,
          mandatory: false,
          name: '2232323',
          options: [],
          placeholder: 'adsf',
          prefix: '',
          type: 'DATE',
          value: null,
        },
        {
          id: 211326,
          mandatory: false,
          name: 'select all 2',
          options: [],
          placeholder: 'helo date',
          prefix: '',
          type: 'DATE',
          value: '2023-02-13T17:00:00.000Z',
        },
      ];
      const result = timezoneService.convertAllDatesToProperLocale(data, '05:30:00');

      expect(result).toEqual(new Date('2023-02-13T06:30:00.000Z'));
    });

    it('should return the data as it is if not a date instance', () => {
      const data: TxnCustomProperties[] = [
        {
          id: 206198,
          mandatory: false,
          name: '2232323',
          options: [],
          placeholder: 'adsf',
          prefix: '',
          type: 'MULTI_SELECT',
          value: 'some non-date value',
        },
      ];

      utilityService.traverse.and.callFake((object, callback) => {
        const nonDateProp = data[0].value;
        return callback(nonDateProp);
      });

      const result = timezoneService.convertAllDatesToProperLocale(data, '05:30:00');
      expect(result).toEqual('some non-date value');
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
