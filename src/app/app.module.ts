import { APP_INITIALIZER, ErrorHandler, InjectionToken, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { Router, RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientJsonpModule, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpConfigInterceptor } from './core/interceptors/httpInterceptor';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Deploy } from 'cordova-plugin-ionic/dist/ngx';
import { SharedModule } from './shared/shared.module';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import * as Sentry from '@sentry/angular';
import { ConfigService } from './core/services/config.service';
import { RouterAuthService } from './core/services/router-auth.service';
import { TokenService } from './core/services/token.service';
import { SecureStorageService } from './core/services/secure-storage.service';
import { StorageService } from './core/services/storage.service';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    pinch: { enable: false },
    rotate: { enable: false },
  };
}

export const MIN_SCREEN_WIDTH = new InjectionToken<number>(
  'Minimum screen width to act as breakpoint between regular and small devices'
);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    GoogleMapsModule,
    SharedModule,
    HammerModule,
    HttpClientJsonpModule,
    SharedModule,
    HammerModule,
  ],
  providers: [
    GooglePlus,
    InAppBrowser,
    Deploy,
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
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.loadConfigurationData(),
      deps: [ConfigService, RouterAuthService, TokenService, SecureStorageService, StorageService, Sentry.TraceService],
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
    TitleCasePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
