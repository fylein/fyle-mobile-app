import { Injectable } from '@angular/core';
import * as moment from 'moment';

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

  constructor() {}

  getDayShortCodeMap() {
    return {
      sun: 'Sunday',
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
    };
  }

  getDayIsoNumberMap() {
    return {
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
      sun: 7,
    };
  }

  getIsoNumberDayMap() {
    return {
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
      7: 'sun',
    };
  }

  getDayNumberMap() {
    return {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };
  }

  getNumberDayMap() {
    return {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };
  }

  getNumberMonthMap() {
    return {
      0: 'January',
      1: 'February',
      2: 'March',
      3: 'April',
      4: 'May',
      5: 'June',
      6: 'July',
      7: 'August',
      8: 'September',
      9: 'October',
      10: 'November',
      11: 'December',
    };
  }

  getTimeIntervals() {
    return this.timeIntervals;
  }

  getMeridians() {
    return this.meridians;
  }

  firstOfThisMonth() {
    return new Date(this.year, this.month, 1);
  }

  getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  lastOfThisMonth() {
    return new Date(this.year, this.month + 1, 0, 23, 59);
  }

  getUTCDate(date) {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  }

  getLocalDate(date) {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset);
  }

  // unovoidable right now
  // eslint-disable-next-line complexity
  fixDates(data) {
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

    // needed for company reports filters
    if (data.physical_bill_at) {
      data.physical_bill_at = new Date(data.physical_bill_at);
    }

    return data;
  }

  // Use this method if you are getting api response from V2.
  fixDatesV2(data) {
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

  parseISOLocal(s) {
    const b = s.split(/\D/);
    return new Date(b[0], b[1] - 1, b[2]);
  }

  getDifferenceBetweenDates(toDate, fromDate) {
    return Math.ceil(Math.abs(toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  }

  getAbsoluteDifferenceBetweenDates(toDate, fromDate) {
    return Math.ceil((fromDate.getTime() - toDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  }

  addDaysToDate(fromDate, numOfDays) {
    numOfDays = parseInt(numOfDays, 10);

    return new Date(fromDate.getTime() + numOfDays * 24 * 60 * 60 * 1000);
  }

  getThisMonthRange() {
    const firstDay = this.firstOfThisMonth();
    const lastDay = this.lastOfThisMonth();
    const range = {
      from: firstDay,
      to: lastDay,
    };

    return range;
  }

  firstOfLastMonth() {
    return new Date(this.year, this.month - 1, 1);
  }

  lastOfLastMonth() {
    return new Date(this.year, this.month, 0, 23, 59);
  }

  getLastMonthRange() {
    const firstDay = this.firstOfLastMonth();
    const lastDay = this.lastOfLastMonth();
    const range = {
      from: firstDay,
      to: lastDay,
    };

    return range;
  }

  firstOfThisWeek() {
    return moment().startOf('week');
  }

  lastOfThisWeek() {
    return moment().startOf('week').add(7, 'days');
  }

  getThisWeekRange() {
    return {
      from: this.firstOfThisWeek(),
      to: this.lastOfThisWeek(),
    };
  }

  isSameDate(date1: Date, date2: Date) {
    return moment(date1).startOf('day').isSame(moment(date2).startOf('day'));
  }
}
