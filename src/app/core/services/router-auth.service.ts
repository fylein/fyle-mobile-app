import { Injectable } from '@angular/core';
import { RouterApiService } from './router-api.service';
import { tap, switchMap, map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { AuthResponse } from '../models/auth-response.model';
import { Observable, from } from 'rxjs';
import { AdvanceRequestPolicyService } from './advance-request-policy.service';
import { ApiV2Service } from './api-v2.service';
import { LocationService } from './location.service';
import { TransactionsOutboxService } from './transactions-outbox.service';
import { VendorService } from './vendor.service';
import { PushNotificationService } from './push-notification.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { ExpenseAggregationService } from './expense-aggregation.service';

@Injectable({
  providedIn: 'root',
})
export class RouterAuthService {
  constructor(
    private routerApiService: RouterApiService,
    private storageService: StorageService,
    private tokenService: TokenService,
    private advanceRequestPolicyService: AdvanceRequestPolicyService,
    private apiService: ApiService,
    private apiv2Service: ApiV2Service,
    private locationService: LocationService,
    private transactionOutboxService: TransactionsOutboxService,
    private vendorService: VendorService,
    private pushNotificationService: PushNotificationService,
    private approverPlatformApiService: ApproverPlatformApiService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private expenseAggregationService: ExpenseAggregationService
  ) {}

  checkEmailExists(email: string) {
    return this.routerApiService.post('/auth/basic/email_exists', {
      email,
    });
  }

  async isLoggedIn(): Promise<boolean> {
    return !!(await this.tokenService.getAccessToken()) && !!(await this.tokenService.getRefreshToken());
  }

  async newRefreshToken(refreshToken: string) {
    await this.storageService.delete('user');
    await this.storageService.delete('role');
    await this.tokenService.setRefreshToken(refreshToken);
  }

  async setClusterDomain(domain) {
    this.apiService.setRoot(domain);
    this.advanceRequestPolicyService.setRoot(domain);
    this.apiv2Service.setRoot(domain);
    this.locationService.setRoot(domain);
    this.transactionOutboxService.setRoot(domain);
    this.vendorService.setRoot(domain);
    this.pushNotificationService.setRoot(domain);
    this.spenderPlatformV1ApiService.setRoot(domain);
    this.approverPlatformApiService.setRoot(domain);
    this.spenderPlatformV1ApiService.setRoot(domain);
    this.expenseAggregationService.setRoot(domain);

    await this.tokenService.setClusterDomain(domain);
  }

  async newAccessToken(accessToken) {
    await this.tokenService.setAccessToken(accessToken);
  }

  async fetchAccessToken(refreshToken): Promise<AuthResponse> {
    // this function is called from multiple places, token should be returned and not saved from here
    const accessToken = await this.tokenService.getAccessToken();
    return await this.routerApiService
      .post('/auth/access_token', {
        refresh_token: refreshToken,
        access_token: accessToken,
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

  basicSignin(email: string, password: string): Observable<AuthResponse> {
    return this.routerApiService
      .post('/auth/basic/signin', {
        email,
        password,
      })
      .pipe(switchMap((res) => from(this.handleSignInResponse(res)).pipe(map(() => res))));
  }

  googleSignin(accessToken: string): Observable<AuthResponse> {
    return this.routerApiService
      .post('/auth/google/signin', {
        access_token: accessToken,
      })
      .pipe(switchMap((res) => from(this.handleSignInResponse(res)).pipe(map(() => res))));
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

  resendVerificationLink(email: string, orgId: string) {
    return this.routerApiService.post('/auth/resend_email_verification', {
      email: email?.trim().toLowerCase(),
      org_id: orgId,
    });
  }
}
