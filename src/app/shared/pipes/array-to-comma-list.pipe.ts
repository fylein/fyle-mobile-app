import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayToCommaList',
})
export class ArrayToCommaListPipe implements PipeTransform {
  // Transforms a string array to a comma separated list
  // For example: ['a', 'b', 'c'] => 'a, b and c'
  transform(value: string[]): string {
    if (!value || value.length === 0) {
      return '';
    }

    if (value.length === 1) {
      return value[0];
    }

    const lastItem = value[value.length - 1];
    const restItems = value.slice(0, -1);

    return `${restItems.join(', ')} and ${lastItem}`;
  }
}
