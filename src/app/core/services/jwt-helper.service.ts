import { Injectable } from '@angular/core';
import { JwtHelperService as AngularJwtHelper } from '@auth0/angular-jwt';
import { AccessTokenData } from '../models/access-token-data.model';

@Injectable({
  providedIn: 'root',
})
export class JwtHelperService {
  helper: AngularJwtHelper;

  constructor() {
    this.helper = new AngularJwtHelper();
  }

  decodeToken(rawToken: string): AccessTokenData | Promise<AccessTokenData> {
    return this.helper.decodeToken(rawToken);
  }

  getExpirationDate(rawToken: string): Date {
    return this.helper.getTokenExpirationDate(rawToken) as Date;
  }
}
