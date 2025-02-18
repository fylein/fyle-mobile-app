import deepFreeze from 'deep-freeze-strict';

export const actionSheetOptionsData = deepFreeze([
  {
    text: 'Split Expense',
    handler: () => {},
  },
  {
    text: 'Dismiss as Card Payment',
    handler: () => {},
  },
  {
    text: 'Remove Card Expense',
    handler: () => {},
  },
]);
export const expectedActionSheetButtonRes = deepFreeze([
  {
    text: 'Capture receipt',
    icon: 'assets/svg/camera.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add manually',
    icon: 'assets/svg/list.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add mileage',
    icon: 'assets/svg/mileage.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add per diem',
    icon: 'assets/svg/calendar.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
]);

export const expectedActionSheetButtonsWithMileage = deepFreeze([
  {
    text: 'Capture receipt',
    icon: 'assets/svg/camera.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add manually',
    icon: 'assets/svg/list.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add mileage',
    icon: 'assets/svg/mileage.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
]);

export const expectedActionSheetButtonsWithPerDiem = deepFreeze([
  {
    text: 'Capture receipt',
    icon: 'assets/svg/camera.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add manually',
    icon: 'assets/svg/list.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
  {
    text: 'Add per diem',
    icon: 'assets/svg/calendar.svg',
    cssClass: 'capture-receipt',
    handler: undefined,
  },
]);
