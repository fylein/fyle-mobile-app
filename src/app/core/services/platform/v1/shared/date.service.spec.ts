import { TestBed } from '@angular/core/testing';

import { DateService } from './date.service';

import dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('DateService', () => {
  let dateService: DateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    dateService = TestBed.inject(DateService);
  });

  it('should be created', () => {
    expect(dateService).toBeTruthy();
  });

  it('getUTCDate(): should get UTC date', () => {
    const date = new Date('2023-02-24T12:03:57.680Z');
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;

    expect(dateService.getUTCDate(date)).toEqual(new Date(date.getTime() + userTimezoneOffset));
  });

  describe('fixDates()', () => {
    it('should return the value as is in case it is a nullish value', () => {
      expect(dateService.fixDates(null)).toBeNull();
      expect(dateService.fixDates(undefined)).toBeUndefined();
    });

    it('should return the value as is in case it is non-object value', () => {
      expect(dateService.fixDates('string')).toEqual('string');
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

      const result = dateService.fixDates(mockObject);

      expect(result.spent_at).toEqual(jasmine.any(Date));
      expect(result.data.updated_at).toEqual(jasmine.any(Date));
      expect(result.array[0].created_at).toEqual(jasmine.any(Date));
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

      const result = dateService.fixDates(mockObject);

      expect(result.date).toEqual(jasmine.any(Date));
      expect(result.data.start_date).toEqual(jasmine.any(Date));
      expect(result.array[0].invoice_dt).toEqual(jasmine.any(Date));
      expect(result.array[0].end_date).toEqual(jasmine.any(Date));
    });

    describe('date ingestion methods should work as expected', () => {
      const americaTimezone = 'US/Pacific';
      const newZeaLandTimezone = 'Etc/GMT-12'; // ETC timezones are opposite of what they show.

      // describe('samples of timezone based date testing', () => {
      //   it('timezone mock is working as expected', () => {
      //     const df = dayjs('2024-05-14T00:00:00.000Z').tz(newZeaLandTimezone);
      //     const dateAheadOfUTC = df.get('date');

      //     const dl = dayjs('2024-05-14T00:00:00.000Z').tz(americaTimezone);
      //     const dateBehindUtc = dl.get('date');

      //     expect(dateAheadOfUTC).toEqual(dateBehindUtc + 1);
      //   });
      // });

      describe('GET:', () => {
        it('date is viewed in new zealand', () => {
          const incomingDate = dateService.getUTCMidAfternoonDate(
            dayjs('2024-05-14T00:00:00.000Z').tz(newZeaLandTimezone).toDate()
          );
          const date = incomingDate.getDate();
          const month = incomingDate.getMonth() + 1; // js month is 0 - 11
          const year = incomingDate.getFullYear();

          expect(date).toBe(14);
          expect(month).toBe(5);
          expect(year).toBe(2024);
        });

        it('date is viewed in america', () => {
          const incomingDate = dateService.getUTCMidAfternoonDate(
            dayjs('2024-05-14T00:00:00.000Z').tz(americaTimezone).toDate()
          );
          const date = incomingDate.getDate();
          const month = incomingDate.getMonth() + 1; // js month is 0 - 11
          const year = incomingDate.getFullYear();

          expect(date).toBe(14);
          expect(month).toBe(5);
          expect(year).toBe(2024);
        });
      });

      describe('POST:', () => {
        // it('new date created from new zealand', () => {
        //   const outgoingDate = dayjs(new Date('2024-05-14T00:00:00.000Z')).tz(newZeaLandTimezone).toDate();
        //   outgoingDate.setHours(12);
        //   outgoingDate.setMinutes(0);
        //   outgoingDate.setSeconds(0);
        //   outgoingDate.setMilliseconds(0);
        //   const transformedOutgoingDate = dateService.getUTCMidAfternoonDate(outgoingDate);

        //   const date = new Date().getDate();
        //   const month = new Date().getMonth() + 1; // js month is 0 - 11
        //   const year = new Date().getFullYear();

        //   expect(transformedOutgoingDate.toISOString().split('T')[0]).toBe(
        //     `${year}-${month < 10 ? `0${month}` : month}-${date}`
        //   );
        // });

        // it('new date created from america', () => {
        //   const outgoingDate = dayjs(new Date('2024-05-14T00:00:00.000Z')).tz(americaTimezone).toDate();
        //   outgoingDate.setHours(12);
        //   outgoingDate.setMinutes(0);
        //   outgoingDate.setSeconds(0);
        //   outgoingDate.setMilliseconds(0);
        //   const transformedOutgoingDate = dateService.getUTCMidAfternoonDate(outgoingDate);

        //   const date = new Date().getDate();
        //   const month = new Date().getMonth() + 1; // js month is 0 - 11
        //   const year = new Date().getFullYear();

        //   expect(transformedOutgoingDate.toISOString().split('T')[0]).toBe(
        //     `${year}-${month < 10 ? `0${month}` : month}-${date}`
        //   );
        // });

        it('date edited in new zealand', () => {
          const newDate = dayjs(new Date('2024-05-14T00:00:00.000Z')).tz(newZeaLandTimezone).toDate();
          newDate.setDate(16);
          newDate.setHours(12);
          newDate.setMinutes(0);
          newDate.setSeconds(0);
          newDate.setMilliseconds(0);

          const outgoingDate = dateService.getUTCMidAfternoonDate(newDate);

          expect(outgoingDate.toISOString().split('T')[0]).toBe('2024-05-16');
        });

        it('date edited in america', () => {
          const newDate = dayjs(new Date('2024-05-14T00:00:00.000Z')).tz(americaTimezone).toDate();
          newDate.setDate(16);
          newDate.setHours(12);
          newDate.setMinutes(0);
          newDate.setSeconds(0);
          newDate.setMilliseconds(0);
          const outgoingDate = dateService.getUTCMidAfternoonDate(newDate);

          expect(outgoingDate.toISOString().split('T')[0]).toBe('2024-05-16');
        });
      });
    });
  });
});
