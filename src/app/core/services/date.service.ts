import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { DateParams } from '../models/date-parameters.model';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  today = new Date();

  year = this.today.getFullYear();

  month = this.today.getMonth();

  // '12:00', '12:30' has been removed since cron dosn't support 24
  // eslint-disable-next-line max-len
  timeIntervals = [
    '1:00',
    '1:30',
    '2:00',
    '2:30',
    '3:00',
    '3:30',
    '4:00',
    '4:30',
    '5:00',
    '5:30',
    '6:00',
    '6:30',
    '7:00',
    '7:30',
    '8:00',
    '8:30',
    '9:00',
    '9:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
  ];

  meridians = ['AM', 'PM'];

  firstOfThisMonth(): Date {
    return new Date(this.year, this.month, 1);
  }

  lastOfThisMonth(): Date {
    return new Date(this.year, this.month + 1, 0, 23, 59);
  }

  getUTCDate(date: Date): Date {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  }

  getLocalDate(date: Date): Date {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset);
  }

  // unovoidable right now
  // eslint-disable-next-line complexity
  fixDates<T>(data: T & Partial<DateParams>): T {
    if (data.txn_dt) {
      data.txn_dt = this.getUTCDate(new Date(data.txn_dt));
    }

    if (data.tx_txn_dt) {
      data.tx_txn_dt = this.getUTCDate(new Date(data.tx_txn_dt));
    }

    if (data.created_at) {
      data.created_at = this.getUTCDate(new Date(data.created_at));
    }

    if (data.joining_dt) {
      data.joining_dt = this.getUTCDate(new Date(data.joining_dt));
    }

    if (data.due_at) {
      data.due_at = new Date(data.due_at);
    }

    if (data.updated_at) {
      data.updated_at = new Date(data.updated_at);
    }

    if (data.invoice_dt) {
      data.invoice_dt = new Date(data.invoice_dt);
    }

    if (data.approved_at) {
      data.approved_at = new Date(data.approved_at);
    }

    if (data.ba_created_at) {
      data.ba_created_at = new Date(data.ba_created_at);
    }

    if (data.ba_updated_at) {
      data.ba_updated_at = new Date(data.ba_updated_at);
    }

    if (data.ba_last_synced_at && data.ba_last_synced_at !== null) {
      data.ba_last_synced_at = new Date(data.ba_last_synced_at);
    }

    if (data.paid_at) {
      data.paid_at = new Date(data.paid_at);
    }

    if (data.reimbursed_at) {
      data.reimbursed_at = new Date(data.reimbursed_at);
    }

    if (data.from_dt) {
      data.from_dt = this.getUTCDate(new Date(data.from_dt));
    }

    if (data.to_dt) {
      data.to_dt = this.getUTCDate(new Date(data.to_dt));
    }

    return data;
  }

  // Use this method if you are getting api response from V2.
  fixDatesV2<T>(data: T & Partial<DateParams>): T {
    if (data.tx_txn_dt) {
      data.tx_txn_dt = new Date(data.tx_txn_dt);
    }

    if (data.due_at) {
      data.due_at = new Date(data.due_at);
    }

    if (data.updated_at) {
      data.updated_at = new Date(data.updated_at);
    }

    if (data.invoice_dt) {
      data.invoice_dt = new Date(data.invoice_dt);
    }

    if (data.approved_at) {
      data.approved_at = new Date(data.approved_at);
    }

    if (data.paid_at) {
      data.paid_at = new Date(data.paid_at);
    }

    if (data.reimbursed_at) {
      data.reimbursed_at = new Date(data.reimbursed_at);
    }

    return data;
  }

  addDaysToDate(fromDate: Date, numOfDays: string | number): Date {
    numOfDays = parseInt(numOfDays as string, 10);

    return new Date(fromDate.getTime() + numOfDays * 24 * 60 * 60 * 1000);
  }

  getThisMonthRange(): {
    from: Date;
    to: Date;
  } {
    const firstDay = this.firstOfThisMonth();
    const lastDay = this.lastOfThisMonth();
    const range = {
      from: firstDay,
      to: lastDay,
    };

    return range;
  }

  firstOfLastMonth(): Date {
    return new Date(this.year, this.month - 1, 1);
  }

  lastOfLastMonth(): Date {
    return new Date(this.year, this.month, 0, 23, 59);
  }

  getLastMonthRange(): {
    from: Date;
    to: Date;
  } {
    const firstDay = this.firstOfLastMonth();
    const lastDay = this.lastOfLastMonth();
    const range = {
      from: firstDay,
      to: lastDay,
    };

    return range;
  }

  firstOfThisWeek(): dayjs.Dayjs {
    return dayjs().startOf('week');
  }

  lastOfThisWeek(): dayjs.Dayjs {
    return dayjs().startOf('week').add(7, 'days');
  }

  getThisWeekRange(): {
    from: dayjs.Dayjs;
    to: dayjs.Dayjs;
  } {
    return {
      from: this.firstOfThisWeek(),
      to: this.lastOfThisWeek(),
    };
  }

  getLastDaysRange(numOfDays): {
    from: Date;
    to: Date;
  } {
    const startDate = new Date(this.today.getTime() - numOfDays * 24 * 60 * 60 * 1000);
    return {
      from: startDate,
      to: this.today,
    };
  }

  convertUTCDateToLocalDate(date: Date): Date {
    const newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();
    newDate.setHours(hours - offset);

    return newDate;
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return dayjs(date1).startOf('day').isSame(dayjs(date2).startOf('day'));
  }

  isValidDate(date: string | Date): boolean {
    return dayjs(date).isValid();
  }

  getUTCMidAfternoonDate(date: Date): Date {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const newDate = new Date(date.getTime() + userTimezoneOffset + 12 * 60 * 60 * 1000);
    newDate.setUTCFullYear(date.getFullYear());
    newDate.setUTCMonth(date.getMonth());
    newDate.setUTCDate(date.getDate());
    return newDate;
  }
}
