import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    if (!name) {
      return '';
    }

    const userName = name.trim().split(' ');
    let initials = userName[0].substring(0, 1).toUpperCase();

    if (userName.length > 1) {
      initials += userName[userName.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }
}
