import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'snakeCaseToSpaceCase',
  standalone: false,
})
export class SnakeCaseToSpaceCase implements PipeTransform {
  transform(input: string): string {
    if (input) {
      return input.replace(/_/g, ' ');
    }

    return '';
  }
}
