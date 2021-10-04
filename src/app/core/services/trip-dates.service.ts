import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class TripDatesService {
  constructor() {}

  getUTCDate(date) {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  }

  // unavoidable here
  // eslint-disable-next-line complexity
  fixDates(data) {
    if (data.created_at) {
      data.created_at = new Date(data.created_at);
    }

    if (data.onward_at) {
      data.onward_at = this.getUTCDate(new Date(data.onward_at));
    }

    if (data.booked_at) {
      data.booked_at = new Date(data.booked_at);
    }

    if (data.cancellation_requested_at) {
      data.cancellation_requested_at = new Date(data.cancellation_requested_at);
    }

    if (data.cancelled_at) {
      data.cancelled_at = new Date(data.cancelled_at);
    }

    if (data.check_in_at) {
      data.check_in_at = this.getUTCDate(new Date(data.check_in_at));
    }

    if (data.check_out_at) {
      data.check_out_at = this.getUTCDate(new Date(data.check_out_at));
    }

    if (data.start_date) {
      data.start_date = this.getUTCDate(new Date(data.start_date));
    }

    if (data.end_date) {
      data.end_date = this.getUTCDate(new Date(data.end_date));
    }

    if (data.start_dt) {
      data.start_dt = this.getUTCDate(new Date(data.start_dt));
    }

    if (data.end_dt) {
      data.end_dt = this.getUTCDate(new Date(data.end_dt));
    }

    if (data.onward_dt) {
      data.onward_dt = this.getUTCDate(new Date(data.onward_dt));
    }

    if (data.check_in_dt) {
      data.check_in_dt = this.getUTCDate(new Date(data.check_in_dt));
    }

    if (data.check_out_dt) {
      data.check_out_dt = this.getUTCDate(new Date(data.check_out_dt));
    }

    return data;
  }

  convertToDateFormat(data) {
    if (data.start_dt) {
      data.start_dt = moment(data.start_dt).format('y-MM-D');
    }

    if (data.end_dt) {
      data.end_dt = moment(data.end_dt).format('y-MM-D');
    }

    if (data.onward_dt) {
      data.onward_dt = moment(data.onward_dt).format('y-MM-D');
    }

    if (data.check_in_dt) {
      data.check_in_dt = moment(data.check_in_dt).format('y-MM-D');
    }

    if (data.check_out_dt) {
      data.check_out_dt = moment(data.check_out_dt).format('y-MM-D');
    }

    if (data.trip_cities) {
      data.trip_cities.forEach((tripCity) => {
        if (tripCity.onward_dt) {
          tripCity.onward_dt = moment(tripCity.onward_dt).format('y-MM-D');
        }

        if (tripCity.return_dt) {
          tripCity.return_dt = moment(tripCity.return_dt).format('y-MM-D');
        }
      });
    }

    return data;
  }
}
