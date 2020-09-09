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
import { map, catchError, switchMap } from 'rxjs/operators';

import { JwtHelperService } from '../services/jwt-helper.service';

import * as moment from 'moment';
import { TokenService } from '../services/token.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService
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


  getNewAccessToken() {
    throwError('not implemented yet');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // YOU CAN ALSO DO THIS
    // const token = this.authenticationService.getToke()

    return from(this.tokenService.getAccessToken())
      .pipe(
        switchMap(token => {
          if (!token || this.expiringSoon(token)) {
            this.getNewAccessToken();
          }

          if (token && this.secureUrl(request.url)) {
            request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
          }



          // if (!request.headers.has('Content-Type')) {
          //   request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
          // }
          return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
              if (event instanceof HttpResponse) {
                // do nothing for now
              }
              return event;
            }),
            catchError((error: HttpErrorResponse) => {

              return throwError(error);
            })
          );
        })
      );
  }
}
