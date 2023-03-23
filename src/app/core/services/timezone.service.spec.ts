import { TestBed } from '@angular/core/testing';
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

  describe('convertToTimezone()', () => {
    it('should convert the date to the given timezone when "toUtc" is false', () => {
      const date = new Date('2023-03-13T05:31:00.000Z');
      const offset = '+05:30:00';
      const toUtc = false;
      const expectedDate = new Date('2023-03-13T16:31:00.000Z');
      const result = timezoneService.convertToTimezone(date, offset, toUtc);
      expect(result).toEqual(expectedDate);
    });
  });

  it('convertToUtc(): should call convertToTimezone with the correct parameters', () => {
    const date = new Date('2022-01-01T00:00:00');
    const offset = '05:30:00';
    spyOn(timezoneService, 'convertToTimezone').and.returnValue(date);
    timezoneService.convertToUtc(date, offset);
    expect(timezoneService.convertToTimezone).toHaveBeenCalledWith(date, offset, true);
  });
});
