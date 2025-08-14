import deepFreeze from 'deep-freeze-strict';

export const actionSheetOptionsData = deepFreeze([
  {
    text: 'Split expense by category',
    handler: () => {},
  },
  {
    text: 'Split expense by project',
    handler: () => {},
  },
  {
    text: 'Split expense by cost center',
    handler: () => {},
  },
  {
    text: 'Dismiss as card payment',
    handler: () => {},
  },
  {
    text: 'Remove card expense',
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
