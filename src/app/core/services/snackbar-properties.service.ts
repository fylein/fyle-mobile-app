import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SnackbarPropertiesService {
  constructor() {}
  /**
   * Factory function for properties of toast message component
   *
   * @param toastMessageType - Type of toast message: success or failure
   * @param toastMessageData - Object containing the toast message and redirectionText
   * @param snackbarIcon - Optional param to pass the icon name
   * @returns Object to be used for displaying toast message component
   */

  setSnackbarProperties(
    toastMessageType: 'success' | 'failure' | 'information',
    toastMessageData: { message: string; redirectiontext?: string },
    snackbarIcon?: string
  ) {
    if (!snackbarIcon) {
      if (toastMessageType === 'success') {
        snackbarIcon = 'tick-square-filled';
      } else if (toastMessageType === 'failure') {
        snackbarIcon = 'danger';
      }
    }
    return {
      data: {
        icon: snackbarIcon,
        showCloseButton: true,
        ...toastMessageData,
      },
      duration: 3000,
    };
  }
}
