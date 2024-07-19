import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import { from, map, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  constructor(private authService: AuthService) {}

  transform(value: string | Date, isTimePresent?: boolean): Observable<string> {
    let dateFormat = 'MMM DD, YYYY';

    if (!value) {
      return of('');
    }

    return from(this.authService.getEou()).pipe(
      map((eou) => {
        dateFormat = dayjs(value).format(this.getCurrencyToDateFormatMapping(eou.org.currency));

        if (isTimePresent) {
          dateFormat = dateFormat + ' ' + dayjs(value).format('hh:mm A');
        }

        return dateFormat;
      })
    );
  }

  getCurrencyToDateFormatMapping(currency: string): string {
    const currencyToDateFormatMapping: Record<string, string> = {
      USD: 'MM/DD/YYYY',
      INR: 'DD/MM/YYYY',
      AUD: 'DD/MM/YYYY',
      CAD: 'YYYY/MM/DD',
      EUR: 'DD/MM/YYYY',
    };

    return currencyToDateFormatMapping[currency] || 'MMM DD, YYYY';
  }
}
