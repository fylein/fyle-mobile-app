/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParameterCodec,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import * as dayjs from 'dayjs';
import { JwtHelperService } from '../services/jwt-helper.service';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { DeviceService } from '../services/device.service';
import { RouterAuthService } from '../services/router-auth.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { StorageService } from '../services/storage.service';
import { TokenService } from '../services/token.service';
import { UserEventService } from '../services/user-event.service';
@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  public accessTokenCallInProgress = false;

  public accessTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService,
    private routerAuthService: RouterAuthService,
    private deviceService: DeviceService,
    private userEventService: UserEventService,
    private storageService: StorageService,
    private secureStorageService: SecureStorageService
  ) {}

  secureUrl(url: string): boolean {
    if (url.indexOf('localhost') >= 0 || url.indexOf('.fylehq.com') >= 0 || url.indexOf('.fyle.tech') >= 0) {
      if (url.indexOf('/api/auth/') >= 0 || url.indexOf('routerapi/auth/') >= 0) {
        if (url.indexOf('api/auth/logout') >= 0) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }

  expiringSoon(accessToken: string): boolean {
    try {
      const expiryDate = dayjs(this.jwtHelperService.getExpirationDate(accessToken));
      const now = dayjs();
      const differenceSeconds = expiryDate.diff(now, 'seconds');
      const maxRefreshDifferenceSeconds = 2 * 60;
      return differenceSeconds < maxRefreshDifferenceSeconds;
    } catch (err) {
      return true;
    }
  }

  refreshAccessToken(): Observable<string | null> {
    return from(this.tokenService.getRefreshToken()).pipe(
      switchMap((refreshToken) => {
        if (refreshToken) {
          return from(this.routerAuthService.fetchAccessToken(refreshToken)).pipe(
            switchMap((authResponse) => from(this.routerAuthService.newAccessToken(authResponse.access_token))),
            switchMap(() => from(this.tokenService.getAccessToken())),
            catchError((error: HttpErrorResponse) => this.handleError(error)) // Handle refresh errors
          );
        } else {
          return of(null);
        }
      })
    );
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      this.userEventService.logout();
      this.secureStorageService.clearAll();
      this.storageService.clearAll();
      globalCacheBusterNotifier.next();
    }
    return throwError(error); // Rethrow the error to the caller
  }

  /**
   * This method get current accessToken from Storage, check if this token is expiring or not.
   * If the token is expiring it will get another accessToken from API and return the new accessToken
   * If multiple API call initiated then `this.accessTokenCallInProgress` will block multiple access_token call
   * Reference: https://stackoverflow.com/a/57638101
   */
  getAccessToken(): Observable<string | null> {
    return from(this.tokenService.getAccessToken()).pipe(
      switchMap((accessToken) => {
        if (accessToken && !this.expiringSoon(accessToken)) {
          return of(accessToken);
        }
        if (!this.accessTokenCallInProgress) {
          this.accessTokenCallInProgress = true;
          this.accessTokenSubject.next(null);
          return this.refreshAccessToken().pipe(
            switchMap((newAccessToken) => {
              this.accessTokenCallInProgress = false;
              this.accessTokenSubject.next(newAccessToken);
              return of(newAccessToken);
            })
          );
        } else {
          // If a refresh is already in progress, wait for it to complete
          return this.accessTokenSubject.pipe(
            filter((result) => result !== null),
            take(1),
            switchMap(() => from(this.tokenService.getAccessToken()))
          );
        }
      })
    );
  }

  getUrlWithoutQueryParam(url: string): string {
    // Remove query parameters from the URL
    return url.split('?')[0].split(';')[0].substring(0, 200);
  }

  intercept(request: HttpRequest<string>, next: HttpHandler): Observable<HttpEvent<string>> {
    if (this.secureUrl(request.url)) {
      return this.getAccessToken().pipe(
        switchMap((accessToken) => {
          if (!accessToken) {
            return this.handleError({ status: 401, error: 'Unauthorized' } as HttpErrorResponse);
          }
          return this.executeHttpRequest(request, next, accessToken);
        })
      );
    } else {
      return next.handle(request);
    }
  }

  executeHttpRequest(request: HttpRequest<any>, next: HttpHandler, accessToken: string): Observable<HttpEvent<any>> {
    return from(this.deviceService.getDeviceInfo()).pipe(
      switchMap((deviceInfo) => {
        const appVersion = deviceInfo.appVersion || '0.0.0';
        const osVersion = deviceInfo.osVersion;
        const operatingSystem = deviceInfo.operatingSystem;
        const mobileModifiedAppVersion = `fyle-mobile::${appVersion}::${operatingSystem}::${osVersion}`;
        request = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${accessToken}`),
          setHeaders: {
            'X-App-Version': mobileModifiedAppVersion,
            'X-Page-Url': this.getUrlWithoutQueryParam(window.location.href),
            'X-Source-Identifier': 'mobile_app',
          },
        });
        return next.handle(request).pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
      })
    );
  }
}
export class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}
