import { TestBed } from '@angular/core/testing';
import { DateService } from './date.service';
import dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { DateParams } from '../models/date-parameters.model';
import { TranslocoService } from '@jsverse/transloco';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('DateService', () => {
  let dateService: DateService;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  const today = new Date();

  const year = today.getFullYear();

  const month = today.getMonth();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateService],
    });
    dateService = TestBed.inject(DateService);
  });

  it('should be created', () => {
    expect(dateService).toBeTruthy();
  });

  it('firstOfThisMonth(): get the first day of the month', () => {
    expect(dateService.firstOfThisMonth().toDateString()).toEqual(new Date(year, month, 1).toDateString());
  });

  it('lastOfThisMonth(): get the last day of the month', () => {
    expect(dateService.lastOfThisMonth().toDateString()).toEqual(new Date(year, month + 1, 0, 23, 59).toDateString());
  });

  it('isValidDate(): check if date is valid', () => {
    expect(dateService.isValidDate(new Date('2023-02-23T16:24:01.335Z'))).toBeTrue();
  });

  it('isSameDate(): check if two dates are same', () => {
    expect(
      dateService.isSameDate(new Date('2023-02-24T12:03:57.680Z'), new Date('2023-02-23T16:24:01.335Z'))
    ).toBeFalse();
  });

  it('firstOfThisWeek(): get the first day of the month', () => {
    expect(dateService.firstOfThisWeek()).toEqual(dayjs().startOf('week'));
  });

  it('lastOfThisWeek(): get the last day of the month', () => {
    expect(dateService.lastOfThisWeek()).toEqual(dayjs().startOf('week').add(7, 'days'));
  });

  it("getThisWeekRange(): should get this week's range", () => {
    spyOn(dateService, 'firstOfThisWeek').and.returnValue(dayjs().startOf('week'));
    spyOn(dateService, 'lastOfThisWeek').and.returnValue(dayjs().startOf('week').add(7, 'days'));

    expect(dateService.getThisWeekRange()).toEqual({
      from: dayjs().startOf('week'),
      to: dayjs().startOf('week').add(7, 'days'),
    });
  });

  it('firstOfLastMonth(): should get the first of last month', () => {
    expect(dateService.firstOfLastMonth().toDateString()).toEqual(new Date(year, month - 1, 1).toDateString());
  });

  it('lastOfLastMonth(): should get the last of last month', () => {
    expect(dateService.lastOfLastMonth().toDateString()).toEqual(new Date(year, month, 0, 23, 59).toDateString());
  });

  it("getLastMonthRange(): should get last month's range", () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59);

    spyOn(dateService, 'firstOfLastMonth').and.returnValue(firstDay);
    spyOn(dateService, 'lastOfLastMonth').and.returnValue(lastDay);

    expect(dateService.getLastMonthRange()).toEqual({
      from: new Date(year, month - 1, 1),
      to: new Date(year, month, 0, 23, 59),
    });

    expect(dateService.firstOfLastMonth).toHaveBeenCalledTimes(1);
    expect(dateService.lastOfLastMonth).toHaveBeenCalledTimes(1);
  });

  it("getThisMonthRange(): should get this month's range", () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59);

    spyOn(dateService, 'firstOfThisMonth').and.returnValue(firstDay);
    spyOn(dateService, 'lastOfThisMonth').and.returnValue(lastDay);

    expect(dateService.getThisMonthRange()).toEqual({
      from: firstDay,
      to: lastDay,
    });

    expect(dateService.firstOfThisMonth).toHaveBeenCalledTimes(1);
    expect(dateService.lastOfThisMonth).toHaveBeenCalledTimes(1);
  });

  it('convertUTCDateToLocalDate(): should convert given local date to UTC date', () => {
    const date = new Date('2023-02-24T12:03:57.680Z');

    const newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();
    newDate.setHours(hours - offset);

    expect(dateService.convertUTCDateToLocalDate(date)).toEqual(newDate);
  });

  it('getUTCDate(): should get UTC date', () => {
    const date = new Date('2023-02-24T12:03:57.680Z');
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;

    expect(dateService.getUTCDate(date)).toEqual(new Date(date.getTime() + userTimezoneOffset));
  });

  it('getLocalDate(): should get local date', () => {
    const date = new Date('2023-02-24T12:03:57.680Z');
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;

    expect(dateService.getLocalDate(date)).toEqual(new Date(date.getTime() - userTimezoneOffset));
  });

  it('addDaysToDate(): should add days to a date', () => {
    const date = new Date('2023-02-24T12:03:57.680Z');
    const numOfDays = '5';

    expect(dateService.addDaysToDate(date, numOfDays)).toEqual(
      new Date(date.getTime() + parseInt(numOfDays, 10) * 24 * 60 * 60 * 1000)
    );
  });

  it('fixDatesV2(): should convert string to date', () => {
    const data = {
      tx_txn_dt: '2022-11-30T06:30:00.000Z',
      due_at: '2023-02-24T12:03:57.680Z',
      updated_at: '2023-02-23T11:46:17.569Z',
      invoice_dt: '2023-02-24T12:03:57.680Z',
      approved_at: '2022-12-14T11:08:19.326',
      paid_at: '2023-02-23T11:46:17.569Z',
      reimbursed_at: '2023-02-23T02:16:15.260Z',
    };

    const updatedData = {
      tx_txn_dt: new Date('2022-11-30T06:30:00.000Z'),
      due_at: new Date('2023-02-24T12:03:57.680Z'),
      updated_at: new Date('2023-02-23T11:46:17.569Z'),
      invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
      approved_at: new Date('2022-12-14T11:08:19.326'),
      paid_at: new Date('2023-02-23T11:46:17.569Z'),
      reimbursed_at: new Date('2023-02-23T02:16:15.260Z'),
    };

    expect(dateService.fixDatesV2<Partial<DateParams>>(data)).toEqual(updatedData);
  });

  describe('fixDates():', () => {
    it('should convert txn_dt', () => {
      const data = {
        txn_dt: '2022-11-30T06:30:00.000Z',
      };
      const userTimezoneOffset = new Date(data.txn_dt).getTimezoneOffset() * 60000;
      spyOn(dateService, 'getUTCDate').and.returnValue(new Date(new Date(data.txn_dt).getTime() + userTimezoneOffset));

      const updatedData = {
        txn_dt: new Date(new Date(data.txn_dt).getTime() + userTimezoneOffset),
      };

      expect(dateService.fixDates<Partial<DateParams>>(data)).toEqual(updatedData);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date('2022-11-30T06:30:00.000Z'));
    });

    it('should convert tx_txn_dt', () => {
      const data = {
        tx_txn_dt: '2023-02-13T01:00:00.000Z',
      };
      const userTimezoneOffset = new Date(data.tx_txn_dt).getTimezoneOffset() * 60000;
      spyOn(dateService, 'getUTCDate').and.returnValue(
        new Date(new Date(data.tx_txn_dt).getTime() + userTimezoneOffset)
      );

      const updatedData = {
        tx_txn_dt: new Date(new Date(data.tx_txn_dt).getTime() + userTimezoneOffset),
      };

      expect(dateService.fixDates<Partial<DateParams>>(data)).toEqual(updatedData);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date('2023-02-13T01:00:00.000Z'));
    });

    it('should convert created_at', () => {
      const data = {
        created_at: '2023-02-23T16:24:01.335Z',
      };
      const userTimezoneOffset = new Date(data.created_at).getTimezoneOffset() * 60000;
      spyOn(dateService, 'getUTCDate').and.returnValue(
        new Date(new Date(data.created_at).getTime() + userTimezoneOffset)
      );

      const updatedData = {
        created_at: new Date(new Date(data.created_at).getTime() + userTimezoneOffset),
      };

      expect(dateService.fixDates<Partial<DateParams>>(data)).toEqual(updatedData);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date('2023-02-23T16:24:01.335Z'));
    });

    it('should convert joining_dt', () => {
      const data = {
        joining_dt: '2017-07-25T00:00:00.000Z',
      };
      const userTimezoneOffset = new Date(data.joining_dt).getTimezoneOffset() * 60000;
      spyOn(dateService, 'getUTCDate').and.returnValue(
        new Date(new Date(data.joining_dt).getTime() + userTimezoneOffset)
      );

      const updatedData = {
        joining_dt: new Date(new Date(data.joining_dt).getTime() + userTimezoneOffset),
      };

      expect(dateService.fixDates<Partial<DateParams>>(data)).toEqual(updatedData);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date('2017-07-25T00:00:00.000Z'));
    });

    it('should convert due_at, updated_at, invoice_dt, approved_at, ba_created_at, ba_updated_at, ba_last_synced_at, paid_at, reimbursed_at', () => {
      const data = {
        due_at: '2022-11-30T06:30:00.000Z',
        ba_created_at: '2023-02-24T12:03:57.680Z',
        updated_at: '2023-02-23T11:46:17.569Z',
        invoice_dt: '2023-02-24T12:03:57.680Z',
        approved_at: '2022-12-14T11:08:19.326',
        paid_at: '2023-02-23T11:46:17.569Z',
        reimbursed_at: '2023-02-23T02:16:15.260Z',
        ba_updated_at: '2023-02-23T11:46:17.569Z',
        ba_last_synced_at: '2023-02-23T02:16:15.260Z',
      };

      const updatedData = {
        due_at: new Date('2022-11-30T06:30:00.000Z'),
        ba_created_at: new Date('2023-02-24T12:03:57.680Z'),
        updated_at: new Date('2023-02-23T11:46:17.569Z'),
        invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
        approved_at: new Date('2022-12-14T11:08:19.326'),
        paid_at: new Date('2023-02-23T11:46:17.569Z'),
        reimbursed_at: new Date('2023-02-23T02:16:15.260Z'),
        ba_updated_at: new Date('2023-02-23T11:46:17.569Z'),
        ba_last_synced_at: new Date('2023-02-23T02:16:15.260Z'),
      };

      expect(dateService.fixDates<Partial<DateParams>>(data)).toEqual(updatedData);
    });

    it('should convert from_dt', () => {
      const data = {
        from_dt: '2022-11-30T06:30:00.000Z',
      };
      const userTimezoneOffset = new Date(data.from_dt).getTimezoneOffset() * 60000;
      spyOn(dateService, 'getUTCDate').and.returnValue(new Date(new Date(data.from_dt).getTime() + userTimezoneOffset));

      const updatedData = {
        from_dt: new Date(new Date(data.from_dt).getTime() + userTimezoneOffset),
      };

      expect(dateService.fixDates<Partial<DateParams>>(data)).toEqual(updatedData);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date('2022-11-30T06:30:00.000Z'));
    });

    it('should convert to_dt', () => {
      const data = {
        to_dt: '2023-02-13T01:00:00.000Z',
      };
      const userTimezoneOffset = new Date(data.to_dt).getTimezoneOffset() * 60000;
      spyOn(dateService, 'getUTCDate').and.returnValue(new Date(new Date(data.to_dt).getTime() + userTimezoneOffset));

      const updatedData = {
        to_dt: new Date(new Date(data.to_dt).getTime() + userTimezoneOffset),
      };

      expect(dateService.fixDates<Partial<DateParams>>(data)).toEqual(updatedData);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date('2023-02-13T01:00:00.000Z'));
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
