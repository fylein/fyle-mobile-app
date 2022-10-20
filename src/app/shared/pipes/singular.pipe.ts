import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'singular',
})
export class SingularPipe implements PipeTransform {
  transform(name: string): string {
    if (!!name) {
      name = name.replace(/s$/i, '');
    }

    return name;
  }
}
