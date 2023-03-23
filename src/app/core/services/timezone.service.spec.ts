import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';

import { TimezoneService } from './timezone.service';
import { UtilityService } from './utility.service';

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

  describe('convertToTimezone()', () => {
    it('should convert the date to UTC when "toUtc" is true', () => {
      const date = new Date('2023-03-22T12:00:00.000+05:30');
      const offset = '05:30:00';
      const toUtc = true;
      const expectedDate = new Date('2023-03-22T06:30:00.000Z');
      const result = timezoneService.convertToTimezone(date, offset, toUtc);
      expect(result).toEqual(expectedDate);
    });

    it('should not modify the date when "toUtc" is false', () => {
      const date = new Date('2023-03-22T12:00:00.000+05:30');
      const offset = '-05:30:00';
      const toUtc = false;
      const expectedDate = new Date('2023-03-22T12:00:00.000+05:30');
      const result = timezoneService.convertToTimezone(date, offset, toUtc);
      expect(result).toEqual(expectedDate);
    });

    it('should not modify the original date object', () => {
      const date = new Date('2023-03-22T12:00:00.000Z');
      const offset = '-05:30:00';
      const toUtc = true;
      const originalDate = new Date(date);

      timezoneService.convertToTimezone(date, offset, toUtc);

      expect(date).toEqual(originalDate);
    });
  });

  it('convertToUtc(): should call convertToTimezone with the correct parameters', () => {
    const date = new Date('2022-01-01T00:00:00Z');
    const offset = '05:30:00';
    spyOn(timezoneService, 'convertToTimezone').and.returnValue(date);
    timezoneService.convertToUtc(date, offset);
    expect(timezoneService.convertToTimezone).toHaveBeenCalledWith(date, offset, true);
  });
});
