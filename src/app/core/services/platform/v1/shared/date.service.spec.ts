import { TestBed } from '@angular/core/testing';

import { DateService } from './date.service';

describe('DateService', () => {
  let service: DateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUTCDate(): should get UTC date', () => {
    const date = new Date('2023-02-24T12:03:57.680Z');
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;

    expect(service.getUTCDate(date)).toEqual(new Date(date.getTime() + userTimezoneOffset));
  });

  describe('fixDates()', () => {
    it('should return the value as is in case it is a nullish value', () => {
      expect(service.fixDates(null)).toBeNull();
      expect(service.fixDates(undefined)).toBeUndefined();
    });

    it('should return the value as is in case it is non-object value', () => {
      expect(service.fixDates('string')).toEqual('string');
    });

    it('should convert date strings to date objects for keys ending with _at', () => {
      const mockObject = {
        spent_at: '2021-02-24T12:03:57.680Z',
        data: {
          updated_at: '2021-02-24T12:03:57.680Z',
        },
        array: [
          {
            created_at: '2021-02-24T12:03:57.680Z',
          },
        ],
      };

      const res = service.fixDates(mockObject);

      expect(res.spent_at).toEqual(jasmine.any(Date));
      expect(res.data.updated_at).toEqual(jasmine.any(Date));
      expect(res.array[0].created_at).toEqual(jasmine.any(Date));
    });

    it('should convert date strings to date objects for date, invoice_dt, start_date and end_date fields', () => {
      const mockObject = {
        date: '2021-02-24T12:03:57.680Z',
        data: {
          start_date: '2021-02-24T12:03:57.680Z',
        },
        array: [
          {
            invoice_dt: '2021-02-24T12:03:57.680Z',
            end_date: '2021-02-24T12:03:57.680Z',
          },
        ],
      };

      const res = service.fixDates(mockObject);

      expect(res.date).toEqual(jasmine.any(Date));
      expect(res.data.start_date).toEqual(jasmine.any(Date));
      expect(res.array[0].invoice_dt).toEqual(jasmine.any(Date));
      expect(res.array[0].end_date).toEqual(jasmine.any(Date));
    });
  });
});
