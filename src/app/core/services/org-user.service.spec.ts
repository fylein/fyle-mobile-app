import { TestBed } from '@angular/core/testing';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  currentEouRes,
  currentEouUnflatted,
  eouListWithDisabledUser,
  switchToDelegatorParams,
  extendedOrgUserResponse,
  postUserResponse,
  postUserParam,
  postOrgUser,
  accessTokenData,
  accessTokenWithProxyOrgUserId,
} from '../test-data/org-user.service.spec.data';
import { eouPlatformApiResponse } from '../mock-data/extended-org-user.data';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { EmployeeResponse } from '../models/employee-response.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { of } from 'rxjs';
import { OrgUserService } from './org-user.service';
import { TokenService } from './token.service';
import { delegatorData } from '../mock-data/platform/v1/delegator.data';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('OrgUserService', () => {
  let orgUserService: OrgUserService;
  let jwtHelperService: jasmine.SpyObj<JwtHelperService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('spenderPlatformV1ApiService', ['get', 'post']);
    const jwtHelperServiceSpy = jasmine.createSpyObj('JwtHelperService', ['decodeToken']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getAccessToken']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['newRefreshToken', 'refreshEou']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['transformEmployeeResponse']);

    TestBed.configureTestingModule({
      providers: [
        OrgUserService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: JwtHelperService,
          useValue: jwtHelperServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    orgUserService = TestBed.inject(OrgUserService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    jwtHelperService = TestBed.inject(JwtHelperService) as jasmine.SpyObj<JwtHelperService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
  });

  it('should be created', () => {
    expect(orgUserService).toBeTruthy();
  });

  it('should be able to get current eou', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(
      of({ data: eouPlatformApiResponse } as PlatformApiResponse<EmployeeResponse>),
    );
    dataTransformService.transformEmployeeResponse.withArgs(eouPlatformApiResponse).and.returnValue(currentEouRes);

    orgUserService.getCurrent().subscribe((res) => {
      expect(res).toEqual(currentEouRes);
      done();
    });
  });

  it('should be able to get user by ID', (done) => {
    apiService.get.and.returnValue(of(currentEouUnflatted));
    const userId = 'ouhOiO1Tfs3f';
    orgUserService.getUserById(userId).subscribe((res) => {
      expect(res).toEqual(currentEouUnflatted);
      expect(apiService.get).toHaveBeenCalledWith('/eous/' + userId);
      done();
    });
  });

  it('should be able to exclude eou by employee status', () => {
    const status = 'DISABLED';
    const eousFiltered = eouListWithDisabledUser.filter((eou) => status.indexOf(eou.ou.status) === -1);
    expect(orgUserService.excludeByStatus(eouListWithDisabledUser, status)).toEqual(eousFiltered);
  });

  it('should be able to return undefined if eou param is missing when excluding eou by status', () => {
    const status = 'DISABLED';
    expect(orgUserService.excludeByStatus(null, status)).toEqual([]);
  });

  it('should be able to find delegated accounts', (done) => {
    const delegatorList = { data: [delegatorData] };
    spenderPlatformV1ApiService.get.and.returnValue(of(delegatorList));

    orgUserService.findDelegatedAccounts().subscribe((res) => {
      expect(res).toEqual([delegatorData]);
      done();
    });
  });

  it('should be able to switch to delegator account', (done) => {
    apiService.post.and.returnValue(of(extendedOrgUserResponse));
    authService.newRefreshToken.and.returnValue(of(extendedOrgUserResponse));

    orgUserService.switchToDelegator(delegatorData.user_id, switchToDelegatorParams.org_id).subscribe((res) => {
      expect(res).toEqual(extendedOrgUserResponse);
      done();
    });
  });

  it('should be able to post user', (done) => {
    apiService.post.and.returnValue(of(postUserResponse));
    orgUserService.postUser(postUserParam).subscribe((res) => {
      expect(res).toEqual(postUserResponse);
      done();
    });
  });

  it('should be able to post org user', (done) => {
    const platformResponse = { data: postOrgUser };
    spenderPlatformV1ApiService.post.and.returnValue(of(platformResponse));
    orgUserService.postOrgUser(postOrgUser).subscribe((res) => {
      expect(res).toEqual(postOrgUser);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/employees', {
        data: { id: postOrgUser.id, mobile: postOrgUser.mobile },
      });
      done();
    });
  });

  it('should be able to mark active', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(extendedOrgUserResponse));
    authService.refreshEou.and.returnValue(of(extendedOrgUserResponse));
    orgUserService.markActive().subscribe((res) => {
      expect(res).toEqual(extendedOrgUserResponse);
      done();
    });
  });

  it('should be able to switch to delegatee account', (done) => {
    apiService.post.and.returnValue(of(extendedOrgUserResponse));
    authService.newRefreshToken.and.returnValue(of(extendedOrgUserResponse));

    orgUserService.switchToDelegatee().subscribe((res) => {
      expect(res).toEqual(extendedOrgUserResponse);
      done();
    });
  });

  it('sendDeviceToken(): should send device token to the backend', (done) => {
    const token = 'test-device-token';
    spenderPlatformV1ApiService.post.and.returnValue(of({}));

    orgUserService.sendDeviceToken(token).subscribe((res) => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/users/device_token', {
        data: { token },
      });
      expect(res).toEqual({});
      done();
    });
  });

  it('should return false if the user is not switched to a delegator', (done) => {
    jwtHelperService.decodeToken.and.returnValue(accessTokenData);
    // This token contains the user details such as user id, org id, org user id, roles, scopes, etc.
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzI5MTcyMDAsImlzcyI6IkZ5bGVBcHAiLCJ1c2VyX2lkIjoidXNNakxpYm15ZTdzIiwib3JnX3VzZXJfaWQiOiJvdXJ3N0hpNG1tcE8iLCJvcmdfaWQiOiJvck5WdGhUbzJaeW8iLCJyb2xlcyI6IltcIkZZTEVSXCIsXCJGSU5BTkNFXCIsXCJBRE1JTlwiLFwiQVBQUk9WRVJcIixcIlZFUklGSUVSXCIsXCJQQVlNRU5UX1BST0NFU1NPUlwiLFwiSE9QXCJdIiwic2NvcGVzIjoiW10iLCJhbGxvd2VkX0NJRFJzIjoiW10iLCJ2ZXJzaW9uIjoiMyIsImNsdXN0ZXJfZG9tYWluIjoiXCJodHRwczovL3N0YWdpbmcuZnlsZS50ZWNoXCIiLCJleHAiOjE2NzI5MjA4MDB9.hTMJ56cPH_HgKhZSKNCOIEGAzaAXCfIgbEYcaudhXwk';
    tokenService.getAccessToken.and.resolveTo(token);

    orgUserService.isSwitchedToDelegator().then((res) => {
      expect(res).toBeFalse();
      done();
    });
  });

  it('should return true if the user is switched to a delegator', (done) => {
    jwtHelperService.decodeToken.and.returnValue(accessTokenWithProxyOrgUserId);
    // This token contains the user details such as user id, org id, org user id, roles, scopes, etc.
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzI5MTcxNTgsImlzcyI6IkZ5bGVBcHAiLCJ1c2VyX2lkIjoidXNCa0pEMVVtMTc0Iiwib3JnX3VzZXJfaWQiOiJvdTVxclBKYkdmV00iLCJvcmdfaWQiOiJvck5WdGhUbzJaeW8iLCJyb2xlcyI6IltcIkZZTEVSXCIsXCJWRVJJRklFUlwiXSIsInNjb3BlcyI6IltdIiwicHJveHlfb3JnX3VzZXJfaWQiOiJvdXJ3N0hpNG1tcE8iLCJhbGxvd2VkX0NJRFJzIjoiW10iLCJ2ZXJzaW9uIjoiMyIsImNsdXN0ZXJfZG9tYWluIjoiXCJodHRwczovL3N0YWdpbmcuZnlsZS50ZWNoXCIiLCJleHAiOjE2NzI5MjA3NTh9.VqpiTmEd_Kp-fK11gBV-VfjEkPhCja-diu-TGDGPeKA';
    tokenService.getAccessToken.and.resolveTo(token);

    orgUserService.isSwitchedToDelegator().then((res) => {
      expect(res).toBeTrue();
      done();
    });
  });
});
