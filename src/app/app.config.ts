import { InjectionToken } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

export class MyHammerConfig extends HammerGestureConfig {
  override overrides = {
    pinch: { enable: false },
    rotate: { enable: false },
  };
}

export const MIN_SCREEN_WIDTH = new InjectionToken<number>(
  'Minimum screen width to act as breakpoint between regular and small devices'
);
