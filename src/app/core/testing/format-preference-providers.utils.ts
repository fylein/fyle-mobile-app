import { Provider } from '@angular/core';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { FORMAT_PREFERENCES } from 'src/app/constants';
import { FormatPreferences } from 'src/app/core/models/format-preferences.model';

/**
 * Provides common test providers required by many components and pipes.
 * This includes providers for DATE_PIPE_DEFAULT_OPTIONS, TIMEZONE, and FORMAT_PREFERENCES
 * that are needed by DateWithTimezonePipe and other components.
 */
export function getFormatPreferenceProviders(): Provider[] {
  return [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: 'MMM dd, yyyy' },
    },
    {
      provide: FORMAT_PREFERENCES,
      useValue: {
        timeFormat: 'hh:mm a',
        currencyFormat: {
          placement: 'before' as const,
          thousandSeparator: ',',
          decimalSeparator: '.',
        },
      } as FormatPreferences,
    },
  ];
}
