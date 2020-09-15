import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError, from } from 'rxjs';
import { map, catchError, switchMap, mergeMap, concatMap } from 'rxjs/operators';

import { JwtHelperService } from '../services/jwt-helper.service';

import * as moment from 'moment';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { RouterAuthService } from '../services/router-auth.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService,
    private routerAuthService: RouterAuthService
  ) { }

  secureUrl(url) {
    if (
      url.indexOf('.fyle.in') >= 0 ||
      url.indexOf('localhost') >= 0 ||
      url.indexOf('.fylehq.com') >= 0 ||
      url.indexOf('.fylehq.ninja') >= 0) {
      if (url.indexOf('/api/auth/') >= 0 || url.indexOf('routerapi/auth/') >= 0) {
        return false;
      }
      return true;
    }
    return false;
  }

  expiringSoon(accessToken: string) {
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

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.tokenService.getAccessToken())
      .pipe(
        concatMap(token => {
          if (token && this.secureUrl(request.url)) {
            request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
          }
          return next.handle(request).pipe(
            catchError((error) => {
              if (error instanceof HttpErrorResponse) {
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
