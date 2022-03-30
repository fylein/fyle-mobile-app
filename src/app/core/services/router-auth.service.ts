import { Injectable } from '@angular/core';
import { RouterApiService } from './router-api.service';
import { tap, switchMap, map } from 'rxjs/operators';
import { SecureStorageService } from './secure-storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { AuthResponse } from '../models/auth-response.model';
import { Observable, from } from 'rxjs';
import { AdvanceRequestPolicyService } from './advance-request-policy.service';
import { ApiV2Service } from './api-v2.service';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { LocationService } from './location.service';
import { PolicyApiService } from './policy-api.service';
import { TransactionsOutboxService } from './transactions-outbox.service';
import { VendorService } from './vendor.service';
import { TripRequestPolicyService } from './trip-request-policy.service';
import { PushNotificationService } from './push-notification.service';

@Injectable({
  providedIn: 'root',
})
export class RouterAuthService {
  constructor(
    private routerApiService: RouterApiService,
    private secureStorageService: SecureStorageService,
    private tokenService: TokenService,
    private advanceRequestPolicyService: AdvanceRequestPolicyService,
    private apiService: ApiService,
    private apiv2Service: ApiV2Service,
    private duplicateDetectionService: DuplicateDetectionService,
    private locationService: LocationService,
    private policyApiService: PolicyApiService,
    private transactionOutboxService: TransactionsOutboxService,
    private vendorService: VendorService,
    private tripRequestPolicyService: TripRequestPolicyService,
    private pushNotificationService: PushNotificationService
  ) {}

  checkEmailExists(email) {
    return this.routerApiService.post('/auth/basic/email_exists', {
      email,
    });
  }

  async isLoggedIn(): Promise<boolean> {
    return !!(await this.tokenService.getAccessToken()) && !!(await this.tokenService.getRefreshToken());
  }

  async newRefreshToken(refreshToken) {
    await this.secureStorageService.delete('user');
    await this.secureStorageService.delete('role');
    await this.tokenService.setRefreshToken(refreshToken);
  }

  async setClusterDomain(domain) {
    this.apiService.setRoot(domain);
    this.advanceRequestPolicyService.setRoot(domain);
    this.apiv2Service.setRoot(domain);
    this.tripRequestPolicyService.setRoot(domain);
    this.duplicateDetectionService.setRoot(domain);
    this.locationService.setRoot(domain);
    this.policyApiService.setRoot(domain);
    this.transactionOutboxService.setRoot(domain);
    this.vendorService.setRoot(domain);
    this.pushNotificationService.setRoot(domain);

    await this.tokenService.setClusterDomain(domain);
  }

  async newAccessToken(accessToken) {
    await this.tokenService.setAccessToken(accessToken);
  }

  async fetchAccessToken(refreshToken): Promise<AuthResponse> {
    // this function is called from multiple places, token should be returned and not saved from here
    return await this.routerApiService
      .post('/auth/access_token', {
        refresh_token: refreshToken,
      })
      .toPromise();
  }

  sendResetPassword(email: string) {
    return this.routerApiService.post('/auth/send_reset_password', {
      email,
    });
  }

  async handleSignInResponse(data) {
    // if (environment.NAME === 'dev') {
    //   data.cluster_domain = environment.CLUSTER_DOMAIN;
    //   data.redirect_url = data.redirect_url.replace('https://staging.fyle.in', data.cluster_domain);
    // }
    await this.newRefreshToken(data.refresh_token);
    await this.setClusterDomain(data.cluster_domain);
    const resp = await this.fetchAccessToken(data.refresh_token);
    await this.newAccessToken(resp.access_token);
    return data;
  }

  basicSignin(email, password): Observable<AuthResponse> {
    return this.routerApiService
      .post('/auth/basic/signin', {
        email,
        password,
      })
      .pipe(switchMap((res) => from(this.handleSignInResponse(res)).pipe(map(() => res))));
  }

  googleSignin(accessToken): Observable<AuthResponse> {
    return this.routerApiService
      .post('/auth/google/signin', {
        access_token: accessToken,
      })
      .pipe(switchMap((res) => from(this.handleSignInResponse(res)).pipe(map(() => res))));
  }

  checkIfFreeDomain(email: string) {
    const domainList = ['hotmail.com', 'rediffmail.com', 'yahoo.com', 'outlook.com'];
    const domain = email.split('@')[1];
    return domainList.indexOf(domain.toLowerCase()) > -1;
  }

  emailVerify(verificationCode: string) {
    return this.routerApiService
      .post('/auth/email_verify', {
        verification_code: verificationCode,
      })
      .pipe(switchMap((res) => from(this.handleSignInResponse(res)).pipe(map(() => res))));
  }

  resetPassword(refreshToken: string, newPassword: string) {
    return this.routerApiService
      .post('/auth/reset_password', {
        refresh_token: refreshToken,
        password: newPassword,
      })
      .pipe(switchMap((data) => this.handleSignInResponse(data)));
  }

  resendVerificationLink(email: string) {
    return this.routerApiService.post('/auth/resend_email_verification', {
      email: email?.trim().toLowerCase(),
    });
  }

  getRegions() {
    return this.routerApiService.get('/regions').pipe(map((data) => data.regions));
  }
}
