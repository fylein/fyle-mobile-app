import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormatPreferences } from './core/models/format-preferences.model';

export const PAGINATION_SIZE = new InjectionToken<number>('API Pagination size');

export const DEVICE_PLATFORM = new InjectionToken<'android' | 'ios' | 'web'>('Device Platform');

export const TIMEZONE = new InjectionToken<BehaviorSubject<string>>('UTC');

export const FORMAT_PREFERENCES = new InjectionToken<FormatPreferences>('FORMAT_PREFERENCES');
