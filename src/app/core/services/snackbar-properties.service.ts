import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SnackbarPropertiesService {

  constructor() { }

  /*
    Set snackbar properties to be displayed
    - toastMessageType - success or failure
    - toastMessageData - Object containing the toast message and recdirectionText(if any)
  */

  setSnackbarProperties(toastMessageType: string, toastMessageData: {message: string; redirectiontext?: string}) {
    const snackbarIcon = toastMessageType === 'success' ? 'tick-square-filled' : 'danger';
    return {
      data: {
        icon: snackbarIcon,
        showCloseButton: true,
        ...toastMessageData
      },
      duration: 3000
    };
  }
}
