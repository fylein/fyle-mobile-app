import { Injectable } from '@angular/core';
import { SnackbarProperties } from '../models/snackbar-properties.model';

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
    toastMessageData: { message: string; redirectionText?: string },
    snackbarIcon?: string
  ): SnackbarProperties {
    if (!snackbarIcon) {
      if (toastMessageType === 'success') {
        snackbarIcon = 'check-square-fill';
      } else if (toastMessageType === 'failure') {
        snackbarIcon = 'warning-fill';
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
