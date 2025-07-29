import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toLowerCase',
  standalone: false,
})
export class ToLowerCase implements PipeTransform {
  transform(input: string): string {
    if (input) {
      return input.toLowerCase();
    }

    return '';
  }
}
