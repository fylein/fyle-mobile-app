import { Injectable } from '@angular/core';
import { RouterApiService } from './router-api.service';
import { tap, switchMap, map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { AuthResponse } from '../models/auth-response.model';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterAuthService {

  constructor(
    private routerApiService: RouterApiService,
    private storageService: StorageService,
    private tokenService: TokenService,
    private apiService: ApiService
  ) { }

  checkEmailExists(email) {
    return this.routerApiService.post('/auth/basic/email_exists', {
      email
    });
  }

  async isLoggedIn(): Promise<boolean> {
    return !!(await this.tokenService.getAccessToken()) && !!(await this.tokenService.getRefreshToken());
  }

  async newRefreshToken(refreshToken) {
    await this.storageService.delete('user');
    await this.storageService.delete('role');
    await this.tokenService.setRefreshToken(refreshToken);
  }

  async setClusterDomain(domain) {
    this.apiService.setRoot(domain);
    await this.tokenService.setClusterDomain(domain);
  }

  async newAccessToken(accessToken) {
    await this.tokenService.setAccessToken(accessToken);
  }

  async fetchAccessToken(refreshToken): Promise<AuthResponse> {
    // this function is called from multiple places, token should be returned and not saved from here
    return await this.routerApiService.post('/auth/access_token', {
      refresh_token: refreshToken
    }).toPromise();
  }

  sendResetPassword(email: string) {
    return this.routerApiService.post('/auth/send_reset_password', {
      email
    });
  }

  canSignup(email: string) {
    return this.routerApiService.post('/auth/basic/can_signup', {
      email
    });
  }

  async handleSignInResponse(data) {
    // if (environment.NAME === 'dev') {
    //   data.cluster_domain = environment.CLUSTER_DOMAIN;
    //   data.redirect_url = data.redirect_url.replace('https://staging.fyle.in', data.cluster_domain);
    // }
    this.newRefreshToken(data.refresh_token);
    this.setClusterDomain(data.cluster_domain);
    const resp = await this.fetchAccessToken(data.refresh_token);
    this.newAccessToken(resp.access_token);
    return data;
  }

  basicSignin(email, password): Observable<AuthResponse> {
    return this.routerApiService.post('/auth/basic/signin', {
      email,
      password
    }).pipe(
      tap(async res => await this.handleSignInResponse(res))
    );
  }

  googleSignin(accessToken): Observable<AuthResponse> {
    return this.routerApiService.post('/auth/google/signin', {
      access_token: accessToken
    }).pipe(
      tap(async res => await this.handleSignInResponse(res))
    );
  }

  checkIfFreeDomain(email: string) {
    const domainList = ['hotmail.com', 'rediffmail.com', 'yahoo.com', 'outlook.com'];
    const domain = email.split('@')[1];
    return domainList.indexOf(domain.toLowerCase()) > -1;
  }

  emailVerify(verificationCode: string) {
    return this.routerApiService.post('/auth/email_verify', {
      verification_code: verificationCode
    }).pipe(
      switchMap((data) => {
        return from(this.handleSignInResponse(data));
      })
    );
  }

  resetPassword(refreshToken: string, newPassword: string) {
    return this.routerApiService.post('/auth/reset_password', {
      refresh_token: refreshToken,
      password: newPassword
    }).pipe(
      switchMap(data => this.handleSignInResponse(data))
    );
  }

  getRegions() {
    return this.routerApiService.get('/regions').pipe(
      map((data) => {
        return data.regions;
      })
    );
  }

  basicSignup(email, fullName, title, mobile, signupParams, persona, password, region) {
    return this.routerApiService.post('/auth/basic/signup', {
      email,
      password,
      full_name: fullName,
      title,
      mobile,
      signup_params: signupParams,
      persona,
      region
    });
  }
}
