import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'singular',
  standalone: false,
})
export class SingularPipe implements PipeTransform {
  transform(name: string): string {
    if (!!name) {
      name = name.replace(/s$/i, '');
    }

    return name;
  }
}
