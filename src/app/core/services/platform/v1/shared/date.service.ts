import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  // List of date fields that are not suffixed with _at
  dateFields = ['date', 'invoice_dt'];

  getUTCDate(date: Date): Date {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  }

  fixDates<T>(object: T): T {
    const clone = cloneDeep(object);

    for (const key in clone) {
      if (Object.prototype.hasOwnProperty(key)) {
        const valueType = typeof clone[key];
        if ((key.endsWith('_at') || this.dateFields.includes(key)) && valueType === 'string') {
          // @ts-expect-error
          clone[key] = this.getUTCDate(new Date(clone[key] as string));
        } else if (valueType === 'object') {
          clone[key] = this.fixDates(clone[key]);
        }
      }
    }

    return clone;
  }
}
