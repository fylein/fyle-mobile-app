/*
 * This enum can be used to change the behaviour of android hardware back button
 * based on priority that we assign to the action.
 *
 * Default Priorities:
 * 0 -> Angular routing (User will go back to previous route/page)
 * 99 -> If ion-menu is opened, it'll be closed
 * 100 -> Any overlay component (modal, popover, etc.) will be closed.
 *
 * Ref - https://ionicframework.com/docs/developing/hardware-back-button#internal-framework-handlers
 */
export enum BackButtonActionPriority {
  LOW = 10,
  MEDIUM = 20,
  HIGH = 200,
  VERY_HIGH = 300,
  ABSOLUTE = 9999,
}
