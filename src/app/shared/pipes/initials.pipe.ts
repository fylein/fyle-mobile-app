import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials'
})
export class InitialsPipe implements PipeTransform {

  transform(name) {
    let userName;
    let  initials;
    userName = name.split(' '),
    initials = userName[0].substring(0, 1).toUpperCase();

    if (userName.length > 1) {
        initials += userName[userName.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

}
