import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const PAGINATION_SIZE = new InjectionToken<number>('API Pagination size');

export const DEVICE_PLATFORM = new InjectionToken<'android' | 'ios' | 'web'>('Device Platform');

export const TIMEZONE = new InjectionToken<BehaviorSubject<string>>('UTC');
