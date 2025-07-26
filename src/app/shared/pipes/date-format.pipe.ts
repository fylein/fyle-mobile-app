import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'dateFormat',
  standalone: false,
})
export class DateFormatPipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) {}

  transform(value: string | Date): string {
    return dayjs(value).format(this.translocoService.translate('pipes.dateFormat.format'));
  }
}
