import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParameterCodec,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, forkJoin, from, iif, of, throwError } from 'rxjs';
import { catchError, concatMap, filter, mergeMap, take } from 'rxjs/operators';

import { JwtHelperService } from '../services/jwt-helper.service';

import * as dayjs from 'dayjs';
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

  public accessTokenSubject = new BehaviorSubject<string>(null);

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
      const now = dayjs(new Date());
      const differenceSeconds = expiryDate.diff(now, 'second');
      const maxRefreshDifferenceSeconds = 2 * 60;
      return differenceSeconds < maxRefreshDifferenceSeconds;
    } catch (err) {
      return true;
    }
  }

  refreshAccessToken(): Observable<string> {
    return from(this.tokenService.getRefreshToken()).pipe(
      concatMap((refreshToken) => this.routerAuthService.fetchAccessToken(refreshToken)),
      catchError((error) => {
        this.userEventService.logout();
        this.secureStorageService.clearAll();
        this.storageService.clearAll();
        globalCacheBusterNotifier.next();
        return throwError(error);
      }),
      concatMap((authResponse) => this.routerAuthService.newAccessToken(authResponse.access_token)),
      concatMap(() => from(this.tokenService.getAccessToken()))
    );
  }

  /**
   * This method get current accessToken from Storage, check if this token is expiring or not.
   * If the token is expiring it will get another accessToken from API and return the new accessToken
   * If multiple API call initiated then `this.accessTokenCallInProgress` will block multiple access_token call
   * Reference: https://stackoverflow.com/a/57638101
   */
  getAccessToken(): Observable<string> {
    return from(this.tokenService.getAccessToken()).pipe(
      concatMap((accessToken) => {
        if (this.expiringSoon(accessToken)) {
          if (!this.accessTokenCallInProgress) {
            this.accessTokenCallInProgress = true;
            this.accessTokenSubject.next(null);
            return this.refreshAccessToken().pipe(
              concatMap((newAccessToken) => {
                this.accessTokenCallInProgress = false;
                this.accessTokenSubject.next(newAccessToken);
                return of(newAccessToken);
              })
            );
          } else {
            return this.accessTokenSubject.pipe(
              filter((result) => result !== null),
              take(1),
              concatMap(() => from(this.tokenService.getAccessToken()))
            );
          }
        } else {
          return of(accessToken);
        }
      })
    );
  }

  intercept(request: HttpRequest<string>, next: HttpHandler): Observable<HttpEvent<string>> {
    return forkJoin({
      token: iif(() => this.secureUrl(request.url), this.getAccessToken(), of(null)),
      deviceInfo: from(this.deviceService.getDeviceInfo()),
    }).pipe(
      concatMap(({ token, deviceInfo }) => {
        if (token && this.secureUrl(request.url)) {
          request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
          const params = new HttpParams({ encoder: new CustomEncoder(), fromString: request.params.toString() });
          request = request.clone({ params });
        }
        const appVersion = deviceInfo.appVersion || '0.0.0';
        const osVersion = deviceInfo.osVersion;
        const operatingSystem = deviceInfo.operatingSystem;
        const mobileModifiedappVersion = `fyle-mobile::${appVersion}::${operatingSystem}::${osVersion}`;
        request = request.clone({ headers: request.headers.set('X-App-Version', mobileModifiedappVersion) });

        return next.handle(request).pipe(
          catchError((error) => {
            if (error instanceof HttpErrorResponse) {
              if (this.expiringSoon(token)) {
                return from(this.refreshAccessToken()).pipe(
                  mergeMap((newToken) => {
                    request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + newToken) });
                    return next.handle(request);
                  })
                );
              } else if (
                (error.status === 404 && error.headers.get('X-Mobile-App-Blocked') === 'true') ||
                error.status === 401
              ) {
                this.userEventService.logout();
                this.secureStorageService.clearAll();
                this.storageService.clearAll();
                globalCacheBusterNotifier.next();
                return throwError(error);
              }
            }
            return throwError(error);
          })
        );
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
