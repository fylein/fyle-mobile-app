import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HammerGestureConfig } from '@angular/platform-browser';

export const PAGINATION_SIZE = new InjectionToken<number>('API Pagination size');

export const DEVICE_PLATFORM = new InjectionToken<'android' | 'ios' | 'web'>('Device Platform');

export const TIMEZONE = new InjectionToken<BehaviorSubject<string>>('UTC');

export const MIN_SCREEN_WIDTH = new InjectionToken<number>('Minimum screen width');

export class MyHammerConfig extends HammerGestureConfig {
  override overrides = {
    pinch: { enable: false },
    rotate: { enable: false },
  };
}
