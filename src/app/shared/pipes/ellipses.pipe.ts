import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  transform(textContent: string, length: number) {
    if (length === undefined || textContent === undefined || textContent === null) {
      return textContent;
    }

    if (textContent.length > length) {
      return textContent.substring(0, length) + '...';
    } else {
      return textContent;
    }
  }
}
