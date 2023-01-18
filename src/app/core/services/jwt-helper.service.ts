import { Injectable } from '@angular/core';
import { JwtHelperService as AngularJwtHelper } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class JwtHelperService {
  helper: AngularJwtHelper;

  constructor() {
    this.helper = new AngularJwtHelper();
  }

  decodeToken(rawToken: string) {
    return this.helper.decodeToken(rawToken);
  }

  getExpirationDate(rawToken: string) {
    return this.helper.getTokenExpirationDate(rawToken) as Date;
  }

  isTokenExpired(rawToken: string) {
    return this.helper.isTokenExpired(rawToken);
  }
}
