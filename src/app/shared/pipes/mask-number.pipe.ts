import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskNumber',
  standalone: true,
})
export class MaskNumber implements PipeTransform {
  transform(input: string): string {
    if (!input) {
      return input;
    }

    return '****' + input.toString().slice(-4);
  }
}
