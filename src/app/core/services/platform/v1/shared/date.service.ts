import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  // List of date fields that are not suffixed with _at
  dateFields = ['date', 'invoice_dt', 'start_date', 'end_date'];

  getUTCDate(date: Date): Date {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  }

  getUTCMidAfternoonDate(date: Date): Date {
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const newDate = new Date(date.getTime() + userTimezoneOffset + 12 * 60 * 60 * 1000);
    newDate.setUTCFullYear(date.getFullYear());
    newDate.setUTCMonth(date.getMonth());
    newDate.setUTCDate(date.getDate());
    return newDate;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isExpenseComment(obj: any): boolean {
    return obj && typeof obj === 'object' && 'comment' in obj && 'action' in obj && 'action_data' in obj;
  }

  fixDates<T>(object: T): T {
    if (!object || typeof object !== 'object') {
      return object;
    }

    const clone = cloneDeep(object);
    for (const key in clone) {
      if (clone.hasOwnProperty(key) && clone[key]) {
        const value = clone[key];

        if (typeof value === 'object') {
          // Use recursion to fix nested objects
          // Skipping processing the expense comment object since we are using dateWithTimezone pipe.
          clone[key] = this.isExpenseComment(value) ? value : this.fixDates(value);
        } else {
          const isDateField = key.endsWith('_at') || this.dateFields.includes(key);
          if (isDateField) {
            // @ts-expect-error
            // Expecting errors here from typescript, since we can't assign Date to any random key of a generic type
            // In this case, this is safe to do since all keys ending with _at and the predefined ones will be Date only
            clone[key] = this.getUTCDate(new Date(clone[key]));
          }
        }
      }
    }

    return clone;
  }
}
