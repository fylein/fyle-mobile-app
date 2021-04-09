import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpParams,
  HttpParameterCodec
} from '@angular/common/http';

import { Observable, throwError, from, forkJoin, of, iif, Subject, BehaviorSubject } from 'rxjs';
import { catchError, mergeMap, concatMap, filter, take } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { RouterAuthService } from '../services/router-auth.service';
import { DeviceService } from '../services/device.service';
import * as moment from 'moment';
import { JwtHelperService } from '../services/jwt-helper.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  private accessTokenTokenCallInProgress = false;
  private accessTokenSubject: Subject<any> = new BehaviorSubject<any>(null);

  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService,
    private routerAuthService: RouterAuthService,
    private deviceService: DeviceService
  ) { }

  secureUrl(url) {
    if (
      url.indexOf('.fyle.in') >= 0 ||
      url.indexOf('localhost') >= 0 ||
      url.indexOf('.fylehq.com') >= 0 ||
      url.indexOf('.fyle.tech') >= 0 ||
      url.indexOf('.fylehq.ninja') >= 0) {
      if (
        url.indexOf('/api/auth/') >= 0 ||
        url.indexOf('routerapi/auth/') >= 0) {
        return false;
      }
      return true;
    }
    return false;
  }

  expiringSoon(accessToken: string): boolean {
    try {
      const expiryDate = moment(this.jwtHelperService.getExpirationDate(accessToken));
      const now = moment(new Date());
      const differenceSeconds = expiryDate.diff(now, 'second');
      const maxRefreshDifferenceSeconds = 2 * 60;
      return differenceSeconds < maxRefreshDifferenceSeconds;
    } catch (err) {
      return true;
    }
  }

  refreshAccessToken() {
    return from(this.tokenService.getRefreshToken()).pipe(
      concatMap(
        refreshToken => this.routerAuthService.fetchAccessToken(refreshToken)
      ),
      concatMap(
        authResponse => this.routerAuthService.newAccessToken(authResponse.access_token)
      ),
      concatMap(() => from(this.tokenService.getAccessToken()))
    );
  }

  /**
   * This method get current accessToken from Storage, check if this token is expiring or not.
   * If the token is expiring it will get another accessToken from API and return the new accessToken
   */
   getAccessToken(): Observable<string> {
    return from(this.tokenService.getAccessToken()).pipe(
      concatMap(accessToken => {
        if (this.expiringSoon(accessToken)) {
          if (!this.accessTokenTokenCallInProgress) {
            this.accessTokenTokenCallInProgress = true;
            this.accessTokenSubject.next(null);
            return from(this.tokenService.getRefreshToken()).pipe(
              concatMap(refreshToken => {
                return from(this.routerAuthService.fetchAccessToken(refreshToken));
              }),
              concatMap(authResponse => {
                return from(this.routerAuthService.newAccessToken(authResponse.access_token))
              }),
              concatMap(() => {
                return from(this.tokenService.getAccessToken())
              }),
              concatMap((newAccessToken) => {
                this.accessTokenTokenCallInProgress = false;
                this.accessTokenSubject.next(newAccessToken);
                return of(newAccessToken);
              })
            );
          } else {
            return this.accessTokenSubject.pipe(
              filter(result => result !== null),
              take(1),
              concatMap(() => {
                return from(this.tokenService.getAccessToken())
              })
            );
          }
        } else {
          return of(accessToken);
        }
      })
    );
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return forkJoin({
      token: iif(() => this.secureUrl(request.url), this.getAccessToken(), of(null)),
      deviceInfo: from(this.deviceService.getDeviceInfo())
    }).pipe(
        concatMap(({token, deviceInfo}) => {
          if (token && this.secureUrl(request.url)) {
            request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
            const params = new HttpParams({encoder: new CustomEncoder(), fromString: request.params.toString()});
            request = request.clone({params});
          }
          const appVersion = deviceInfo.appVersion || '0.0.0';
          const osVersion = deviceInfo.osVersion;
          const operatingSystem = deviceInfo.operatingSystem;
          const mobileModifiedappVersion = `fyle-mobile::${appVersion}::${operatingSystem}::${osVersion}`;
          request = request.clone({ headers: request.headers.set('X-App-Version', mobileModifiedappVersion) });

          return next.handle(request).pipe(
            catchError((error) => {
              if (error instanceof HttpErrorResponse && this.expiringSoon(token)) {
                return from(this.refreshAccessToken()).pipe(
                  mergeMap((newToken) => {
                    request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + newToken) });
                    return next.handle(request);
                  })
                );
              }
              return throwError(error);
            })
          );
        })
      );
  }
}

class CustomEncoder implements HttpParameterCodec {
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
