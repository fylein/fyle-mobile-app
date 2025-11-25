import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  private datePipe = inject(DatePipe);

  transform(value: string | Date): string {
    return this.datePipe.transform(value) ?? '';
  }
}
