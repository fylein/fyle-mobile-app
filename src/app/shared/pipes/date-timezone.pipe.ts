import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Pipe({
  name: 'dateTimezone',
})
export class DateTimezonePipe implements PipeTransform {
  transform(value: string, timezone: string, format: string = 'MMM DD, YYYY'): string {
    return dayjs(value).tz(timezone).format(format);
  }
}
