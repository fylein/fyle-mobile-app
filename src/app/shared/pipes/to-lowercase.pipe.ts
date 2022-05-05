import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toLowerCase',
})
export class ToLowerCase implements PipeTransform {
  transform(input) {
    if (input) {
      return input.toLowerCase();
    }

    return '';
  }
}
