import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterAuthService } from './router-auth.service';
import { RouterApiService } from './router-api.service';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { LocationService } from './location.service';
import { TransactionsOutboxService } from './transactions-outbox.service';
import { VendorService } from './vendor.service';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformCommonApiService } from './platform-common-api.service';
import { of } from 'rxjs';
import { apiAuthRes, authResData1 } from '../mock-data/auth-response.data';
import { SpenderService } from './platform/v1/spender/spender.service';
import { ApproverService } from './platform/v1/approver/approver.service';
import { TrackingService } from './tracking.service';

describe('RouterAuthService', () => {
  let routerAuthService: RouterAuthService;
  let routerApiService: jasmine.SpyObj<RouterApiService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let locationService: jasmine.SpyObj<LocationService>;
  let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let vendorService: jasmine.SpyObj<VendorService>;
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let platformCommonApiService: jasmine.SpyObj<PlatformCommonApiService>;
  let spenderService: jasmine.SpyObj<SpenderService>;
  let approverService: jasmine.SpyObj<ApproverService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  const access_token =
    'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2Nzk5MDQ0NTQsImlzcyI6IkZ5bGVBcHAiLCJ1c2VyX2lkIjoidXN2S0E0WDhVZ2NyIiwib3JnX3VzZXJfaWQiOiJvdVg4ZHdzYkxDTHYiLCJvcmdfaWQiOiJvck5WdGhUbzJaeW8iLCJyb2xlcyI6IltcIkFETUlOXCIsXCJBUFBST1ZFUlwiLFwiRllMRVJcIixcIkhPUFwiLFwiSE9EXCIsXCJPV05FUlwiXSIsInNjb3BlcyI6IltdIiwiYWxsb3dlZF9DSURScyI6IltdIiwidmVyc2lvbiI6IjMiLCJjbHVzdGVyX2RvbWFpbiI6IlwiaHR0cHM6Ly9zdGFnaW5nLmZ5bGUudGVjaFwiIiwiZXhwIjoxNjc5OTA4MDU0fQ.z3i-MqE3NNyxPEvWFCSr3q58rLXn3LZcIBskW9BLN48';
  const refresh_token =
    'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2Nzk5MDQ0NTQsImlzcyI6IkZ5bGVBcHAiLCJvcmdfdXNlcl9pZCI6Ilwib3VYOGR3c2JMQ0x2XCIiLCJjbHVzdGVyX2RvbWFpbiI6IlwiaHR0cHM6Ly9zdGFnaW5nLmZ5bGUudGVjaFwiIiwiZXhwIjoxOTk1MjY0NDU0fQ.w6CRqukiEU3s0jCoNUqzZpTvU62ImpPU4by1biNzFoo';

  const email = 'ajain@fyle.in';

  beforeEach(() => {
    const routerApiServiceSpy = jasmine.createSpyObj('RouterApiService', ['post']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['delete']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', [
      'getAccessToken',
      'getRefreshToken',
      'setRefreshToken',
      'setClusterDomain',
      'setAccessToken',
    ]);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['setRoot']);
    const locationServiceSpy = jasmine.createSpyObj('LocationService', ['setRoot']);
    const transactionOutboxServiceSpy = jasmine.createSpyObj('TransactionsOutboxService', ['setRoot']);
    const vendorServiceSpy = jasmine.createSpyObj('VendorService', ['setRoot']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['setRoot']);
    const platformCommonApiServiceSpy = jasmine.createSpyObj('PlatformCommonApiService', ['setRoot']);
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['setRoot']);
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['setRoot']);
    const approverServiceSpy = jasmine.createSpyObj('ApproverService', ['setRoot']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['setRoot']);

    TestBed.configureTestingModule({
      providers: [
        RouterAuthService,
        {
          provide: RouterApiService,
          useValue: routerApiServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: LocationService,
          useValue: locationServiceSpy,
        },
        {
          provide: TransactionsOutboxService,
          useValue: transactionOutboxServiceSpy,
        },
        {
          provide: VendorService,
          useValue: vendorServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: PlatformCommonApiService,
          useValue: platformCommonApiServiceSpy,
        },
        {
          provide: ApproverPlatformApiService,
          useValue: approverPlatformApiServiceSpy,
        },
        {
          provide: SpenderService,
          useValue: spenderServiceSpy,
        },
        {
          provide: ApproverService,
          useValue: approverServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
    });
    routerAuthService = TestBed.inject(RouterAuthService);
    routerApiService = TestBed.inject(RouterApiService) as jasmine.SpyObj<RouterApiService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
    transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    vendorService = TestBed.inject(VendorService) as jasmine.SpyObj<VendorService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    platformCommonApiService = TestBed.inject(PlatformCommonApiService) as jasmine.SpyObj<PlatformCommonApiService>;
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService,
    ) as jasmine.SpyObj<ApproverPlatformApiService>;
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
    approverService = TestBed.inject(ApproverService) as jasmine.SpyObj<ApproverService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
  });

  it('should be created', () => {
    expect(routerAuthService).toBeTruthy();
  });

  it('checkEmailExists(): should check if an email exists', (done) => {
    routerApiService.post.and.returnValue(of({}));

    routerAuthService.checkEmailExists(email).subscribe((res) => {
      expect(res).toEqual({});
      expect(routerApiService.post).toHaveBeenCalledOnceWith('/auth/basic/email_exists', {
        email,
      });
      done();
    });
  });

  it('setClusterDomain(): should set cluster domain', (done) => {
    const domain = 'https://staging.fyle.tech';

    routerAuthService.setClusterDomain(domain).then((res) => {
      expect(apiService.setRoot).toHaveBeenCalledOnceWith(domain);
      expect(locationService.setRoot).toHaveBeenCalledOnceWith(domain);
      expect(transactionOutboxService.setRoot).toHaveBeenCalledOnceWith(domain);
      expect(vendorService.setRoot).toHaveBeenCalledOnceWith(domain);
      expect(approverPlatformApiService.setRoot).toHaveBeenCalledOnceWith(domain);
      expect(spenderPlatformV1ApiService.setRoot).toHaveBeenCalledWith(domain);
      expect(platformCommonApiService.setRoot).toHaveBeenCalledWith(domain);
      expect(spenderPlatformV1ApiService.setRoot).toHaveBeenCalledTimes(2);
      expect(tokenService.setClusterDomain).toHaveBeenCalledOnceWith(domain);
      expect(spenderService.setRoot).toHaveBeenCalledOnceWith(domain);
      expect(approverService.setRoot).toHaveBeenCalledOnceWith(domain);
      expect(trackingService.setRoot).toHaveBeenCalledOnceWith(domain);
      done();
    });
  });

  it('isLoggedIn(): should check if user is logged in', (done) => {
    tokenService.getAccessToken.and.resolveTo(access_token);
    tokenService.getRefreshToken.and.resolveTo(refresh_token);

    routerAuthService.isLoggedIn().then((res) => {
      expect(res).toBeTrue();
      expect(tokenService.getAccessToken).toHaveBeenCalledTimes(1);
      expect(tokenService.getRefreshToken).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('newRefreshToken(): should set new refresh token', async () => {
    tokenService.setRefreshToken.and.resolveTo(null);
    const deleteUser = await storageService.delete('user');
    const deleteRole = await storageService.delete('role');

    const result = await routerAuthService.newRefreshToken(refresh_token);
    expect(result).toBeUndefined();
    expect(deleteUser).toBeUndefined();
    expect(deleteRole).toBeUndefined();
    expect(tokenService.setRefreshToken).toHaveBeenCalledOnceWith(refresh_token);
  });

  it('newAccessToken(): should set new access token', fakeAsync(() => {
    tokenService.setAccessToken.and.resolveTo(null);

    tick();
    routerAuthService.newAccessToken(access_token).then((res) => {
      expect(res).toBeUndefined();
      expect(tokenService.setAccessToken).toHaveBeenCalledOnceWith(
        'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2Nzk5MDQ0NTQsImlzcyI6IkZ5bGVBcHAiLCJ1c2VyX2lkIjoidXN2S0E0WDhVZ2NyIiwib3JnX3VzZXJfaWQiOiJvdVg4ZHdzYkxDTHYiLCJvcmdfaWQiOiJvck5WdGhUbzJaeW8iLCJyb2xlcyI6IltcIkFETUlOXCIsXCJBUFBST1ZFUlwiLFwiRllMRVJcIixcIkhPUFwiLFwiSE9EXCIsXCJPV05FUlwiXSIsInNjb3BlcyI6IltdIiwiYWxsb3dlZF9DSURScyI6IltdIiwidmVyc2lvbiI6IjMiLCJjbHVzdGVyX2RvbWFpbiI6IlwiaHR0cHM6Ly9zdGFnaW5nLmZ5bGUudGVjaFwiIiwiZXhwIjoxNjc5OTA4MDU0fQ.z3i-MqE3NNyxPEvWFCSr3q58rLXn3LZcIBskW9BLN48',
      );
    });
  }));

  it('fetchAccessToken(): should fetch access token', fakeAsync(() => {
    routerApiService.post.and.returnValue(of(apiAuthRes));
    tokenService.getAccessToken.and.resolveTo(access_token);

    tick();

    routerAuthService.fetchAccessToken(refresh_token).then((res) => {
      expect(res).toEqual(apiAuthRes);
      expect(routerApiService.post).toHaveBeenCalledOnceWith('/auth/access_token', {
        refresh_token,
        access_token,
      });
    });
  }));

  it('handleSignInResponse(): should handle sign in response', (done) => {
    spyOn(routerAuthService, 'newRefreshToken').and.callThrough();
    spyOn(routerAuthService, 'setClusterDomain').and.callThrough();
    spyOn(routerAuthService, 'fetchAccessToken').and.resolveTo(apiAuthRes);
    spyOn(routerAuthService, 'newAccessToken').and.callThrough();

    routerAuthService.handleSignInResponse(authResData1).then((res) => {
      expect(res).toEqual(authResData1);
      expect(routerAuthService.newRefreshToken).toHaveBeenCalledOnceWith(authResData1.refresh_token);
      expect(routerAuthService.setClusterDomain).toHaveBeenCalledOnceWith(authResData1.cluster_domain);
      expect(routerAuthService.fetchAccessToken).toHaveBeenCalledOnceWith(authResData1.refresh_token);
      expect(routerAuthService.newAccessToken).toHaveBeenCalledOnceWith(apiAuthRes.access_token);
      done();
    });
  });

  it('resendVerificationLink(): should resend verification link', (done) => {
    const data = {
      cluster_domain: authResData1.cluster_domain,
    };
    routerApiService.post.and.returnValue(of(data));

    routerAuthService.resendVerificationLink(email, authResData1.org_id).subscribe((res) => {
      expect(res).toEqual(data);
      expect(routerApiService.post).toHaveBeenCalledOnceWith('/auth/resend_email_verification', {
        email,
        org_id: authResData1.org_id,
      });
      done();
    });
  });

  it('basicSignin(): should sign in the user with email and password', (done) => {
    routerApiService.post.and.returnValue(of(authResData1));
    spyOn(routerAuthService, 'handleSignInResponse').and.resolveTo(authResData1);
    const password = 'KalaChashma';

    routerAuthService.basicSignin(email, password).subscribe((res) => {
      expect(res).toEqual(authResData1);
      expect(routerAuthService.handleSignInResponse).toHaveBeenCalledOnceWith(authResData1);
      expect(routerApiService.post).toHaveBeenCalledOnceWith('/auth/basic/signin', {
        email,
        password,
      });
      done();
    });
  });

  it('googleSignin(): should sign in the user with google', (done) => {
    routerApiService.post.and.returnValue(of(authResData1));
    spyOn(routerAuthService, 'handleSignInResponse').and.resolveTo(authResData1);

    routerAuthService.googleSignin(access_token).subscribe((res) => {
      expect(res).toEqual(authResData1);
      expect(routerAuthService.handleSignInResponse).toHaveBeenCalledOnceWith(authResData1);
      expect(routerApiService.post).toHaveBeenCalledOnceWith('/auth/google/signin', {
        access_token,
      });
      done();
    });
  });

  it('resetPassword(): should reset user password', (done) => {
    routerApiService.post.and.returnValue(of(authResData1));
    spyOn(routerAuthService, 'handleSignInResponse').and.resolveTo(authResData1);

    const newPassword = 'New_Password';

    routerAuthService.resetPassword(refresh_token, newPassword).subscribe((res) => {
      expect(res).toEqual(authResData1);
      expect(routerAuthService.handleSignInResponse).toHaveBeenCalledOnceWith(authResData1);
      expect(routerApiService.post).toHaveBeenCalledOnceWith('/auth/reset_password', {
        refresh_token,
        password: newPassword,
      });
      done();
    });
  });

  it('emailVerify(): should verify email', (done) => {
    routerApiService.post.and.returnValue(of(authResData1));
    spyOn(routerAuthService, 'handleSignInResponse').and.resolveTo(authResData1);

    const verification_code = 'orNVthTo2Zyo';

    routerAuthService.emailVerify(verification_code).subscribe((res) => {
      expect(res).toEqual(authResData1);
      expect(routerAuthService.handleSignInResponse).toHaveBeenCalledOnceWith(authResData1);
      expect(routerApiService.post).toHaveBeenCalledOnceWith('/auth/email_verify', {
        verification_code,
      });
      done();
    });
  });

  it('sendResetPassword(): should send reset password link', (done) => {
    routerApiService.post.and.returnValue(of({}));

    routerAuthService.sendResetPassword(email).subscribe((res) => {
      expect(res).toEqual({});
      expect(routerApiService.post).toHaveBeenCalledOnceWith('/auth/send_reset_password', {
        email,
      });
      done();
    });
  });
});
