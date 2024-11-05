import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import * as Sentry from '@sentry/angular';
import 'hammerjs';

import { GlobalCacheConfig } from 'ts-cacheable';

// Global cache config
GlobalCacheConfig.maxAge = 10 * 60 * 1000;
GlobalCacheConfig.maxCacheCount = 100;

// To modify the exception values for Http errors to remove query params from the URL so that grouping is done properly in Sentry
const cleanHttpExceptionUrlsForSentryGrouping = (event: Sentry.Event): void => {
  // exceptionValue looks like: 'Http failure response for https://staging.fyle.tech/platform/v1/common/currency/exchange_rate?from=null&to=USD&date=2024-10-01: 400 OK'
  const exceptionValue = event.exception?.values?.[0].value;
  const prefix = 'Http failure response for ';
  const suffixIndicator = ': ';

  if (exceptionValue && exceptionValue.startsWith(prefix)) {
    // Finding the position of the last occurrence of ': '
    const suffixIndex = exceptionValue.lastIndexOf(suffixIndicator);
    if (suffixIndex !== -1) {
      const urlWithQuery = exceptionValue.slice(prefix.length, suffixIndex);
      const urlWithoutQuery = urlWithQuery.split('?')[0];
      const suffix = exceptionValue.slice(suffixIndex + suffixIndicator.length);
      // Updating the exception message
      event.exception.values[0].value = `${prefix}${urlWithoutQuery}${suffixIndicator}${suffix}`;
    }
  }
};

Sentry.init({
  dsn: environment.SENTRY_DSN,
  integrations: [],
  tracesSampleRate: 0.1,
  release: 'please-replace-your-mobile-app-version',
  ignoreErrors: ['Non-Error exception captured', 'Non-Error promise rejection captured'],
  beforeSend(event) {
    cleanHttpExceptionUrlsForSentryGrouping(event);
    return event;
  },
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(() => {});

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);
