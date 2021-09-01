import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'snakeCaseToSpaceCase',
})
export class SnakeCaseToSpaceCase implements PipeTransform {
  transform(input) {
    if (input) {
      return input.replace(/_/g, ' ');
    }

    return '';
  }
}
