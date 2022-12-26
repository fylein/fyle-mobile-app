import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import * as Sentry from '@sentry/angular';
import 'hammerjs';

import { Integrations as TracingIntegrations } from '@sentry/tracing';

Sentry.init({
  dsn: 'https://26a3b90b0c6a49608b873aa099625f21@o341960.ingest.sentry.io/5622998',
  integrations: [
    new TracingIntegrations.BrowserTracing({
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
    new Sentry.Replay({
      inlineStylesheet: true,
      inlineImages: true,
      collectFonts: true,
    }),
  ],
  tracesSampleRate: 1,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
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
