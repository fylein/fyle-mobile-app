import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskNumber',
})
export class MaskNumber implements PipeTransform {
  transform(input) {
    if (input) {
      return !!input ? '****' + input.slice(-4) : input;
    }
  }
}
