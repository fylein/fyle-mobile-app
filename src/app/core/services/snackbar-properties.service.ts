import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SnackbarPropertiesService {

  constructor() { }

  setSnackbarProperties(data: { icon: string; message: string; redirectionText: string },
    panelClass: string[], duration = 1000) {
    return { data: {...data, showCloseButton: true}, panelClass: [ 'mat-snack-bar', data.icon === 'danger' ? 'msb-failure' : 'msb-success',
      ...panelClass], duration };
  }
}
