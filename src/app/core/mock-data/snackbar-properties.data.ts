import deepFreeze from 'deep-freeze-strict';

import { SnackbarProperties } from '../models/snackbar-properties.model';

export const snackbarPropertiesRes: SnackbarProperties = deepFreeze({
  data: {
    icon: 'warning-fill',
    showCloseButton: true,
    message: 'Please select one or more expenses to be reported',
    messageType: 'failure' as const,
  },
  duration: 3000,
});

export const snackbarPropertiesRes2: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: 'Expense added to report successfully',
    messageType: 'success' as const,
  },
  duration: 3000,
});

export const snackbarPropertiesRes3: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: '1 expense has been deleted',
    messageType: 'success' as const,
  },
  duration: 3000,
});

export const snackbarPropertiesRes4: SnackbarProperties = deepFreeze({
  data: {
    icon: 'warning-fill',
    showCloseButton: true,
    message: 'We could not delete the expenses. Please try again',
    messageType: 'failure' as const,
  },
  duration: 3000,
});

export const snackbarPropertiesRes5: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: 'Expenses merged Successfully',
    messageType: 'success' as const,
  },
  duration: 3000,
});

export const snackbarPropertiesRes6: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: '1 Transaction successfully hidden!',
    messageType: 'success' as const,
  },
  duration: 3000,
});

export const snackbarPropertiesRes7: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: '2 Transactions successfully hidden!',
    messageType: 'success' as const,
  },
  duration: 3000,
});

export const dismissExpenseSnackbarProps: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: 'Expense dismissed',
    messageType: 'success' as const,
  },
  duration: 3000,
});
