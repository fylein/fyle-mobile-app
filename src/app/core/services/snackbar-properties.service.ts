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
   * @returns Object to be used for displaying toast message component
   */

  setSnackbarProperties(
    toastMessageType: 'success' | 'failure',
    toastMessageData: { message: string; redirectiontext?: string }
  ) {
    const snackbarIcon = toastMessageType === 'success' ? 'tick-square-filled' : 'danger';
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
