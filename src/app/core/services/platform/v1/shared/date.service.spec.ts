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
    it('should return the input as is if it is null or undefined', () => {
      expect(service.fixDates(null)).toBeNull();
      expect(service.fixDates(undefined)).toBeUndefined();
    });

    it('should convert all date strings in keys ending with _at to date objects', () => {
      const mockObject = {
        spent_at: '2021-02-24T12:03:57.680Z',
        data: {
          some_key: '123',
          nested_spent_at: '2021-02-24T12:03:57.680Z',
        },
        array: [
          {
            nested_spent_at: '2021-02-24T12:03:57.680Z',
          },
        ],
      };

      const res = service.fixDates(mockObject);
      expect(res.spent_at).toEqual(jasmine.any(Date));
      expect(res.data.nested_spent_at).toEqual(jasmine.any(Date));
      expect(res.array[0].nested_spent_at).toEqual(jasmine.any(Date));
    });

    it('should convert all defined date fields that are not suffixed with _at to date objects', () => {
      const mockObject = {
        date: '2021-02-24T12:03:57.680Z',
        data: {
          some_key: '123',
          invoice_dt: '2021-02-24T12:03:57.680Z',
        },
        array: [
          {
            invoice_dt: '2021-02-24T12:03:57.680Z',
          },
        ],
      };

      const res = service.fixDates(mockObject);
      expect(res.date).toEqual(jasmine.any(Date));
      expect(res.data.invoice_dt).toEqual(jasmine.any(Date));
      expect(res.array[0].invoice_dt).toEqual(jasmine.any(Date));
    });
  });
});
