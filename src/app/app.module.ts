import { ErrorHandler, InjectionToken, NgModule, inject, provideAppInitializer } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { Router, RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http';
import { HttpConfigInterceptor } from './core/interceptors/httpInterceptor';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SharedModule } from './shared/shared.module';
import { CurrencyPipe } from '@angular/common';
import * as Sentry from '@sentry/angular';
import { ConfigService } from './core/services/config.service';
import { RouterAuthService } from './core/services/router-auth.service';
import { TokenService } from './core/services/token.service';
import { SecureStorageService } from './core/services/secure-storage.service';
import { StorageService } from './core/services/storage.service';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { PAGINATION_SIZE, DEVICE_PLATFORM } from './constants';
import { Smartlook } from '@awesome-cordova-plugins/smartlook/ngx';
import { Capacitor } from '@capacitor/core';
import { NgOtpInputModule } from 'ng-otp-input';
import { TIMEZONE } from './constants';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { environment } from 'src/environments/environment';
import { TranslocoHttpLoader } from './transloco-http-loader';

export class MyHammerConfig extends HammerGestureConfig {
  override overrides = {
    pinch: { enable: false },
    rotate: { enable: false },
  };
}

export const MIN_SCREEN_WIDTH = new InjectionToken<number>(
  'Minimum screen width to act as breakpoint between regular and small devices'
);

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      innerHTMLTemplatesEnabled: true,
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HammerModule,
    HammerModule,
    NgOtpInputModule,
  ],
  providers: [
    GooglePlus,
    InAppBrowser,
    Smartlook,
    provideTransloco({
      config: {
        availableLangs: ['en'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => {
      const initializerFn = ((transloco: TranslocoService) => async (): Promise<void> => {
        await firstValueFrom(transloco.load('en'));
        transloco.setActiveLang('en');
      })(inject(TranslocoService));
      return initializerFn();
    }),
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
    provideAppInitializer(() => {
      const initializerFn = (
        (configService: ConfigService) => (): Promise<void> =>
          configService.loadConfigurationData()
      )(
        inject(ConfigService),
        inject(RouterAuthService),
        inject(TokenService),
        inject(SecureStorageService),
        inject(StorageService),
        inject(Sentry.TraceService)
      );
      return initializerFn();
    }),
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
  ],
})
export class AppModule {}
