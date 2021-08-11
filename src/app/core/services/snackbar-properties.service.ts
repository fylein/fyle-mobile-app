import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SnackbarPropertiesService {

  constructor() { }

  setSnackbarProperties(data: { icon: string; message: string; redirectionText: string },
    panelClass: string[], duration = 1000) {
    if(data.icon === 'danger') {
      return { data: {...data,  showCloseButton: true}, panelClass: [ 'mat-snack-bar', 'msb-failure', ...panelClass], duration};
    } else {
      return { data: {...data,  showCloseButton: true},  panelClass: [ 'mat-snack-bar', 'msb-success', ...panelClass], duration};
    }
  }
}
