import { Injectable } from '@angular/core';
import { RouterApiService } from './router-api.service';
import { switchMap, map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { AuthResponse } from '../models/auth-response.model';
import { Observable, from } from 'rxjs';
import { LocationService } from './location.service';
import { TransactionsOutboxService } from './transactions-outbox.service';
import { VendorService } from './vendor.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformCommonApiService } from './platform-common-api.service';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { SpenderService } from './platform/v1/spender/spender.service';
import { ApproverService } from './platform/v1/approver/approver.service';
import { EmailExistsResponse } from '../models/email-exists-response.model';
import { ResendEmailVerification } from '../models/resend-email-verification.model';
import { TrackingService } from './tracking.service';

@Injectable({
  providedIn: 'root',
})
export class RouterAuthService {
  constructor(
    private routerApiService: RouterApiService,
    private storageService: StorageService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private locationService: LocationService,
    private transactionOutboxService: TransactionsOutboxService,
    private vendorService: VendorService,
    private approverPlatformApiService: ApproverPlatformApiService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private platformCommonApiService: PlatformCommonApiService,
    private spenderService: SpenderService,
    private approverService: ApproverService,
    private trackingService: TrackingService
  ) {}

  checkEmailExists(email: string): Observable<EmailExistsResponse> {
    return this.routerApiService.post<EmailExistsResponse>('/auth/basic/email_exists', {
      email,
    });
  }

  async isLoggedIn(): Promise<boolean> {
    return !!(await this.tokenService.getAccessToken()) && !!(await this.tokenService.getRefreshToken());
  }

  async newRefreshToken(refreshToken: string): Promise<void> {
    await this.storageService.delete('user');
    await this.storageService.delete('role');
    await this.tokenService.setRefreshToken(refreshToken);
  }

  async setClusterDomain(domain: string): Promise<void> {
    this.apiService.setRoot(domain);
    this.locationService.setRoot(domain);
    this.transactionOutboxService.setRoot(domain);
    this.vendorService.setRoot(domain);
    this.spenderPlatformV1ApiService.setRoot(domain);
    this.approverPlatformApiService.setRoot(domain);
    this.spenderPlatformV1ApiService.setRoot(domain);
    this.platformCommonApiService.setRoot(domain);
    this.spenderService.setRoot(domain);
    this.approverService.setRoot(domain);
    this.trackingService.setRoot(domain);

    await this.tokenService.setClusterDomain(domain);
  }

  async newAccessToken(accessToken: string): Promise<void> {
    await this.tokenService.setAccessToken(accessToken);
  }

  async fetchAccessToken(refreshToken: string): Promise<AuthResponse> {
    // this function is called from multiple places, token should be returned and not saved from here
    const accessToken = await this.tokenService.getAccessToken();
    return await this.routerApiService
      .post<AuthResponse>('/auth/access_token', {
        refresh_token: refreshToken,
        access_token: accessToken,
      })
      .toPromise();
  }

  sendResetPassword(email: string): Observable<{}> {
    return this.routerApiService.post<{}>('/auth/send_reset_password', {
      email,
    });
  }

  async handleSignInResponse(data: AuthResponse): Promise<AuthResponse> {
    await this.newRefreshToken(data.refresh_token);
    await this.setClusterDomain(data.cluster_domain);
    const resp = await this.fetchAccessToken(data.refresh_token);
    await this.newAccessToken(resp.access_token);
    return data;
  }

  basicSignin(email: string, password: string): Observable<AuthResponse> {
    return this.routerApiService
      .post<AuthResponse>('/auth/basic/signin', {
        email,
        password,
      })
      .pipe(switchMap((res) => from(this.handleSignInResponse(res)).pipe(map(() => res))));
  }

  googleSignin(accessToken: string): Observable<AuthResponse> {
    return this.routerApiService
      .post<AuthResponse>('/auth/google/signin', {
        access_token: accessToken,
      })
      .pipe(switchMap((res) => from(this.handleSignInResponse(res)).pipe(map(() => res))));
  }

  emailVerify(verificationCode: string): Observable<AuthResponse> {
    return this.routerApiService
      .post<AuthResponse>('/auth/email_verify', {
        verification_code: verificationCode,
      })
      .pipe(switchMap((res) => from(this.handleSignInResponse(res)).pipe(map(() => res))));
  }

  resetPassword(refreshToken: string, newPassword: string): Observable<AuthResponse> {
    return this.routerApiService
      .post<AuthResponse>('/auth/reset_password', {
        refresh_token: refreshToken,
        password: newPassword,
      })
      .pipe(switchMap((data) => this.handleSignInResponse(data)));
  }

  resendVerificationLink(email: string, orgId: string): Observable<ResendEmailVerification> {
    return this.routerApiService.post<ResendEmailVerification>('/auth/resend_email_verification', {
      email: email?.trim().toLowerCase(),
      org_id: orgId,
    });
  }
}
