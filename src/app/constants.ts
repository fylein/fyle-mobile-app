import { InjectionToken } from '@angular/core';

export const PAGINATION_SIZE = new InjectionToken<number>('API Pagination size');

export const DEVICE_PLATFORM = new InjectionToken<'android' | 'ios' | 'web'>('Device Platform');
