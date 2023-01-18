// @Link:  https://medium.com/@amandeepkochhar/angular-material-datepicker-set-custom-date-in-dd-mm-YYYY-format-5c0f4340e57
import { MatDateFormats, NativeDateAdapter } from '@angular/material/core';
import * as dayjs from 'dayjs';

export class AppDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat): string {
    if (displayFormat === 'input') {
      let day: string = date.getDate().toString();
      day = +day < 10 ? '0' + day : day;
      let month: string = (date.getMonth() + 1).toString();
      month = +month < 10 ? '0' + month : month;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dayjs(date).format('MMM DD, YYYY');
  }
}

export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'MMM DD, YYYY',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};
