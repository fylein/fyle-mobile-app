import deepFreeze from 'deep-freeze-strict';

import { SnackbarProperties } from '../models/snackbar-properties.model';

export const snackbarPropertiesRes = deepFreeze({
  data: {
    icon: 'warning-fill',
    showCloseButton: true,
    message: 'Please select one or more expenses to be reported',
  },
  duration: 3000,
});

export const snackbarPropertiesRes2 = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: 'Expense added to report successfully',
  },
  duration: 3000,
});

export const snackbarPropertiesRes3 = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: '1 expense has been deleted',
  },
  duration: 3000,
});

export const snackbarPropertiesRes4 = deepFreeze({
  data: {
    icon: 'warning-fill',
    showCloseButton: true,
    message: 'We could not delete the expenses. Please try again',
  },
  duration: 3000,
});

export const snackbarPropertiesRes5 = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: 'Expenses merged Successfully',
  },
  duration: 3000,
});

export const snackbarPropertiesRes6: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: '1 Transaction successfully hidden!',
  },
  duration: 3000,
});

export const snackbarPropertiesRes7: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: '2 Transactions successfully hidden!',
  },
  duration: 3000,
});

export const dismissExpenseSnackbarProps: SnackbarProperties = deepFreeze({
  data: {
    icon: 'success',
    showCloseButton: true,
    message: 'Expense dismissed',
  },
  duration: 3000,
});
