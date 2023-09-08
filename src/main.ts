import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import * as Sentry from '@sentry/angular';
import 'hammerjs';

import { Integrations as TracingIntegrations } from '@sentry/tracing';
import { GlobalCacheConfig } from 'ts-cacheable';

// Global cache config
GlobalCacheConfig.maxAge = 10 * 60 * 1000;
GlobalCacheConfig.maxCacheCount = 100;

Sentry.init({
  dsn: environment.SENTRY_DSN,
  integrations: [
    new TracingIntegrations.BrowserTracing({
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  tracesSampleRate: 0.1,
  release: 'please-replace-your-git-commit-version',
  ignoreErrors: ['Non-Error exception captured', 'Non-Error promise rejection captured'],
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(() => {});

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);
