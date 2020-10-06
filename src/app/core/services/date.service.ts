import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }
  getUTCDate (date) {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  }

  fixDates (data) {
    if (data.txn_dt) {
      data.txn_dt = this.getUTCDate(new Date(data.txn_dt));
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
}
