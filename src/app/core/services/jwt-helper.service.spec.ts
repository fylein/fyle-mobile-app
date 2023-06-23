import { TestBed } from '@angular/core/testing';
import { JwtHelperService as AngularJwtHelper } from '@auth0/angular-jwt';

import { JwtHelperService } from './jwt-helper.service';

describe('JwtHelperService', () => {
  let jwtHelperService: JwtHelperService;
  let angularJwtHelper: AngularJwtHelper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JwtHelperService],
    });
    jwtHelperService = TestBed.inject(JwtHelperService);
    angularJwtHelper = new AngularJwtHelper();
  });

  it('should be created', () => {
    expect(jwtHelperService).toBeTruthy();
  });

  it('decodeToken(): should decode token', () => {
    // This token contains the user details such as user id, org id, org user id, roles, scopes, etc.
    const rawToken =
      'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzI5MTcyMDAsImlzcyI6IkZ5bGVBcHAiLCJ1c2VyX2lkIjoidXNNakxpYm15ZTdzIiwib3JnX3VzZXJfaWQiOiJvdXJ3N0hpNG1tcE8iLCJvcmdfaWQiOiJvck5WdGhUbzJaeW8iLCJyb2xlcyI6IltcIkZZTEVSXCIsXCJGSU5BTkNFXCIsXCJBRE1JTlwiLFwiQVBQUk9WRVJcIixcIlZFUklGSUVSXCIsXCJQQVlNRU5UX1BST0NFU1NPUlwiLFwiSE9QXCJdIiwic2NvcGVzIjoiW10iLCJhbGxvd2VkX0NJRFJzIjoiW10iLCJ2ZXJzaW9uIjoiMyIsImNsdXN0ZXJfZG9tYWluIjoiXCJodHRwczovL3N0YWdpbmcuZnlsZS50ZWNoXCIiLCJleHAiOjE2NzI5MjA4MDB9.hTMJ56cPH_HgKhZSKNCOIEGAzaAXCfIgbEYcaudhXwk';
    const expectedToken = angularJwtHelper.decodeToken(rawToken);
    expect(jwtHelperService.decodeToken(rawToken)).toEqual(expectedToken);
  });

  it('getExpirationDate(): should get expiration date', () => {
    // This token contains the user details such as user id, org id, org user id, roles, scopes, etc.
    const rawToken =
      'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzI5MTcyMDAsImlzcyI6IkZ5bGVBcHAiLCJ1c2VyX2lkIjoidXNNakxpYm15ZTdzIiwib3JnX3VzZXJfaWQiOiJvdXJ3N0hpNG1tcE8iLCJvcmdfaWQiOiJvck5WdGhUbzJaeW8iLCJyb2xlcyI6IltcIkZZTEVSXCIsXCJGSU5BTkNFXCIsXCJBRE1JTlwiLFwiQVBQUk9WRVJcIixcIlZFUklGSUVSXCIsXCJQQVlNRU5UX1BST0NFU1NPUlwiLFwiSE9QXCJdIiwic2NvcGVzIjoiW10iLCJhbGxvd2VkX0NJRFJzIjoiW10iLCJ2ZXJzaW9uIjoiMyIsImNsdXN0ZXJfZG9tYWluIjoiXCJodHRwczovL3N0YWdpbmcuZnlsZS50ZWNoXCIiLCJleHAiOjE2NzI5MjA4MDB9.hTMJ56cPH_HgKhZSKNCOIEGAzaAXCfIgbEYcaudhXwk';
    const expectedExpirationDate = angularJwtHelper.getTokenExpirationDate(rawToken);
    expect(jwtHelperService.getExpirationDate(rawToken)).toEqual(expectedExpirationDate as Date);
  });
});
