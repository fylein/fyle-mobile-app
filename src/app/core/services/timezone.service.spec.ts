import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';

import { TimezoneService } from './timezone.service';
import { UtilityService } from './utility.service';
import { txnCustomPropertiesData } from '../mock-data/txn-custom-properties.data';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';

fdescribe('TimezoneService', () => {
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

  //    describe('convertAllDatesToProperLocale(): ', () => {
  //         const objData: TxnCustomProperties[] = [
  //             {
  //                 id: 206198,
  //                 mandatory: false,
  //                 name: '2232323',
  //                 options: [],
  //                 placeholder: 'adsf',
  //                 prefix: '',
  //                 type: 'DATE',
  //                 value: null,
  //             },
  //             {
  //                 id: 211326,
  //                 mandatory: false,
  //                 name: 'select all 2',
  //                 options: [],
  //                 placeholder: 'helo date',
  //                 prefix: '',
  //                 type: 'DATE',
  //                 value: '2023-02-13T17:00:00.000Z',
  //             }
  //         ];

  //         const expectedRes = [
  //             {
  //               id: 206198,
  //               mandatory: false,
  //               name: '2232323',
  //               options: [],
  //               placeholder: 'adsf',
  //               prefix: '',
  //               type: 'DATE',
  //               value: null,
  //             },
  //             {
  //               id: 211326,
  //               mandatory: false,
  //               name: 'select all 2',
  //               options: [],
  //               placeholder: 'helo date',
  //               prefix: '',
  //               type: 'DATE',
  //               value: '2023-02-13T22:30:00.000Z', // converted to UTC with offset '-05:30:00'
  //             },
  //           ];
  //        const offset = '-05:30:00';

  //        it('should not modify non-Date properties', () => {
  //         const result = timezoneService.convertAllDatesToProperLocale(objData, offset);
  //         expect(result[0]).toEqual(objData[0]);
  //       });

  //       it('should convert Date properties to UTC with the specified offset', () => {
  //         const result = timezoneService.convertAllDatesToProperLocale(objData, offset);
  //         console.log(result[1].value);
  //         expect(result[1].value).toEqual('2023-02-13T22:30:00.000Z');
  //       });

  //       it('should not modify the original object', () => {
  //         const result = timezoneService.convertAllDatesToProperLocale(objData, offset);
  //         expect(result).not.toBe(objData);
  //       });
  //     });

  describe('convertToTimezone(): ', () => {
    it('should convert the date to UTC with the specified offset when "toUtc" is true', () => {
      const date = new Date('2023-03-22T12:00:00.000Z');
      const offset = '05:30:00';
      const toUtc = true;
      const expectedDate = new Date('2023-03-22T12:00:00.000Z');

      const result = timezoneService.convertToTimezone(date, offset, toUtc);

      expect(result).toEqual(expectedDate);
    });

    it('should convert the date to the specified offset when "toUtc" is false', () => {
      const date = new Date('2023-03-22T12:00:00.000+05:30');
      const offset = '-05:30:00';
      const toUtc = false;
      const expectedDate = new Date('2023-03-22T12:00:00.000+05:30');
      const result = timezoneService.convertToTimezone(date, offset, toUtc);
      expect(result).toEqual(expectedDate);
    });

    it('should not modify the original date', () => {
      const date = new Date('2023-03-22T12:00:00.000Z');
      const offset = '-05:30:00';
      const toUtc = false;
      timezoneService.convertToTimezone(date, offset, toUtc);
      expect(date).toEqual(new Date('2023-03-22T12:00:00.000Z'));
    });
  });

  it('should call convertToTimezone with the correct parameters', () => {
    const date = new Date('2022-10-31T00:00:00.000Z');
    const offset = '05:30:00';
    spyOn(timezoneService, 'convertToTimezone').and.callThrough();

    const result = timezoneService.convertToUtc(date, offset);

    expect(timezoneService.convertToTimezone).toHaveBeenCalledWith(date, offset, true);
    expect(result).toEqual(new Date('2022-10-30T21:00:00.000Z'));
  });
});
