import { Inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TIMEZONE } from 'src/app/constants';
import { BehaviorSubject } from 'rxjs';

dayjs.extend(utc);
dayjs.extend(timezone);

@Pipe({ name: 'dateWithTimezone', })
@Injectable({ providedIn: 'root' })
export class DateWithTimezonePipe implements PipeTransform {
  constructor(@Inject(TIMEZONE) private timezone$: BehaviorSubject<string>) {}

  transform(value: string | Date, format: string = 'MMM DD, YYYY'): string {
    if (!value) {
      return '';
    }

    const timezone = this.timezone$.value;

    return timezone ? dayjs(value).tz(timezone).format(format) : dayjs(value).format(format);
  }
}
