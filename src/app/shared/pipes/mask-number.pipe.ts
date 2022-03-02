import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskNumber',
})
export class MaskNumberPipe implements PipeTransform {
  transform(value: string): string {
    return !!value ? '****' + value.slice(-4) : value;
  }
}
