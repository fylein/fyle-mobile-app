import { enableProdMode, APP_INITIALIZER, ErrorHandler, InjectionToken, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Capacitor } from '@capacitor/core';

import { MyHammerConfig, MIN_SCREEN_WIDTH } from './app/constants';
import { environment } from './environments/environment';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import * as Sentry from '@sentry/angular';
import 'hammerjs';

import { GlobalCacheConfig } from 'ts-cacheable';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Smartlook } from '@awesome-cordova-plugins/smartlook/ngx';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { environment as environment_1 } from 'src/environments/environment';
import { TranslocoHttpLoader } from './app/transloco-http-loader';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { HAMMER_GESTURE_CONFIG, BrowserModule, HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, Router, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicModule, IonicRouteStrategy, PopoverController } from '@ionic/angular';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http';
import { HttpConfigInterceptor } from './app/core/interceptors/httpInterceptor';
import { CurrencyPipe, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { ConfigService } from './app/core/services/config.service';
import { TIMEZONE, PAGINATION_SIZE, DEVICE_PLATFORM } from './app/constants';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgOtpInputModule } from 'ng-otp-input';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { FyCurrencyPipe } from './app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from './app/shared/pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from './app/shared/pipes/exact-currency.pipe';
import { ReportState } from './app/shared/pipes/report-state.pipe';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { SpinnerDialog } from '@awesome-cordova-plugins/spinner-dialog/ngx';
import { IconModule } from './app/shared/icon/icon.module';

// Global cache config
GlobalCacheConfig.maxAge = 10 * 60 * 1000;
GlobalCacheConfig.maxCacheCount = 100;

const sanitizeUrlForSentryGrouping = (urlWithQuery: string): string => {
  const urlWithoutQuery = urlWithQuery.split('?')[0];

  // Replace `tx` followed by 10 alphanumeric characters (e.g., txXb7rwKyPmI in Http failure response for https://us1.fylehq.com/api/transactions/txXb7rwKyPmI/estatuses: 403 OK)
  return urlWithoutQuery.replace(/\/tx[a-zA-Z0-9]{10}\//g, '/<expense_id>/');
};

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
      const urlWithoutQuery = sanitizeUrlForSentryGrouping(urlWithQuery);

      const suffix = exceptionValue.slice(suffixIndex + suffixIndicator.length);
      // Updating the exception message
      event.exception.values[0].value = `${prefix}${urlWithoutQuery}${suffixIndicator}${suffix}`;
    }
  }
};

const platform = Capacitor.getPlatform();
const isMobileApp = platform === 'android' || platform === 'ios';

if (isMobileApp) {
  Sentry.init({
    dsn: environment.SENTRY_DSN,
    integrations: [],
    tracesSampleRate: 0.1,
    release: environment.LIVE_UPDATE_APP_VERSION,
    ignoreErrors: [
      'Non-Error exception captured',
      'Non-Error promise rejection captured',
      'unhandledError', // "title": "<unknown>"
      'plugin is not implemented on web', // Few plugins are not implemented for web - this error occurs when running the app on local, ignoring those errors
      /Could not load "geocoder"/, // "title": "Error: Uncaught (in promise): Error: Could not load \"geocoder\".",
      /ChunkLoadError: Loading chunk \d+ failed/, // "title": "Error: Uncaught (in promise): Error: The Google Maps JavaScript API could not load.",
      /0 Unknown Error/, // "title": "<unknown>"
      /The Google Maps JavaScript API could not load/, // "title": "Error: Uncaught (in promise): Error: The Google Maps JavaScript API could not load."
      /kCLErrorDomain error/, // "title": "Error: Uncaught (in promise): Error: The operation couldn't be completed. (kCLErrorDomain error 1.)",
    ],
    beforeSend(event) {
      cleanHttpExceptionUrlsForSentryGrouping(event);
      return event;
    },
  });
}

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      HammerModule,
      IconModule,
      NgOtpInputModule,
      IonicModule.forRoot({
        innerHTMLTemplatesEnabled: true,
      })
    ),
    provideRouter(appRoutes, withPreloading(PreloadAllModules)),
    GooglePlus,
    InAppBrowser,
    Smartlook,
    ImagePicker,
    FyCurrencyPipe,
    DatePipe,
    TitleCasePipe,
    ReportState,
    DecimalPipe,
    HumanizeCurrencyPipe,
    ExactCurrencyPipe,
    provideTransloco({
      config: {
        availableLangs: ['en'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (transloco: TranslocoService) => async (): Promise<void> => {
        await firstValueFrom(transloco.load('en'));
        transloco.setActiveLang('en');
      },
      deps: [TranslocoService],
      multi: true,
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    },
    CurrencyPipe,
    ConfigService,
    {
      provide: TIMEZONE,
      useValue: new BehaviorSubject<string>('UTC'),
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => (): Promise<void> => configService.loadConfigurationData(),
      deps: [ConfigService],
      multi: true,
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: MIN_SCREEN_WIDTH,
      useValue: 375,
    },
    {
      provide: PAGINATION_SIZE,
      useValue: 200,
    },
    {
      provide: DEVICE_PLATFORM,
      useValue: Capacitor.getPlatform(),
    },
    provideHttpClient(withInterceptorsFromDi(), withJsonpSupport()),
    provideAnimations(),
  ],
}).catch(() => {});

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);
