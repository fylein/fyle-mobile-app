import { Injectable, Pipe, PipeTransform, inject } from '@angular/core';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TIMEZONE } from 'src/app/constants';
import { BehaviorSubject } from 'rxjs';
import { FORMAT_PREFERENCES } from 'src/app/constants';
import { FormatPreferences } from 'src/app/core/models/format-preferences.model';

dayjs.extend(utc);
dayjs.extend(timezone);

@Pipe({ name: 'dateWithTimezone' })
@Injectable({ providedIn: 'root' })
export class DateWithTimezonePipe implements PipeTransform {
  private timezone$ = inject<BehaviorSubject<string>>(TIMEZONE);

  private datePipeOptions = inject(DATE_PIPE_DEFAULT_OPTIONS);

  private formatPreferences = inject<FormatPreferences>(FORMAT_PREFERENCES, { optional: true });

  private convertToDayjs = (f: string): string =>
    f
      .replace(/yyyy/g, 'YYYY')
      .replace(/yy/g, 'YY')
      .replace(/dd/g, 'DD')
      .replace(/MM/g, 'MM')
      .replace(/MMMM/g, 'MMMM')
      .replace(/MMM/g, 'MMM');

  transform(value: string | Date, format?: string): string {
    if (!value) {
      return '';
    }

    if (format === 'onlyTime') {
      const tz = this.timezone$.value;
      const timeFmt = this.formatPreferences.timeFormat;
      return tz ? dayjs(value).tz(tz).format(timeFmt) : dayjs(value).format(timeFmt);
    }

    const angularFormat = format ?? this.datePipeOptions?.dateFormat;
    const effectiveFormat = this.convertToDayjs(angularFormat);
    const timezone = this.timezone$.value;

    return timezone ? dayjs(value).tz(timezone).format(effectiveFormat) : dayjs(value).format(effectiveFormat);
  }
}
