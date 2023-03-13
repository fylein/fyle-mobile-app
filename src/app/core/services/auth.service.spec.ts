import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { DataTransformService } from './data-transform.service';
import { JwtHelperService } from './jwt-helper.service';
import { apiEouRes, eouFlattended, eouRes3 } from '../mock-data/extended-org-user.data';
import { finalize, noop, of, tap } from 'rxjs';
import { apiAccessTokenRes } from '../mock-data/acess-token-data.data';

describe('AuthService', () => {
  let authService: AuthService;
  let storageService: jasmine.SpyObj<StorageService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let jwtHelperService: jasmine.SpyObj<JwtHelperService>;

  //The token consists of user-details
  const access_token =
    'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzgzNDk1NDksImlzcyI6IkZ5bGVBcHAiLCJ1c2VyX2lkIjoidXN2S0E0WDhVZ2NyIiwib3JnX3VzZXJfaWQiOiJvdVg4ZHdzYkxDTHYiLCJvcmdfaWQiOiJvck5WdGhUbzJaeW8iLCJyb2xlcyI6IltcIkFETUlOXCIsXCJBUFBST1ZFUlwiLFwiRllMRVJcIixcIkhPUFwiLFwiSE9EXCIsXCJPV05FUlwiXSIsInNjb3BlcyI6IltdIiwiYWxsb3dlZF9DSURScyI6IltdIiwidmVyc2lvbiI6IjMiLCJjbHVzdGVyX2RvbWFpbiI6IlwiaHR0cHM6Ly9zdGFnaW5nLmZ5bGUudGVjaFwiIiwiZXhwIjoxNjc4MzUzMTQ5fQ.sOJKf_ndYvhFplZL-KOImnvGujGEReQ7SYq_kvay88w';

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set', 'delete']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', [
      'getAccessToken',
      'resetAccessToken',
      'setRefreshToken',
      'setAccessToken',
    ]);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const jwtHelperServiceSpy = jasmine.createSpyObj('JwtHelperService', ['decodeToken']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
        {
          provide: JwtHelperService,
          useValue: jwtHelperServiceSpy,
        },
      ],
    });
    authService = TestBed.inject(AuthService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    jwtHelperService = TestBed.inject(JwtHelperService) as jasmine.SpyObj<JwtHelperService>;
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('getEou(): should get extended org user', (done) => {
    storageService.get.and.returnValue(Promise.resolve(apiEouRes));

    authService.getEou().then((res) => {
      expect(res).toEqual(apiEouRes);
      expect(storageService.get).toHaveBeenCalledOnceWith('user');
      done();
    });
  });

  it('refreshEou(): should refresh extended org user in memory', (done) => {
    apiService.get.and.returnValue(of(eouFlattended));
    dataTransformService.unflatten.and.returnValue(eouRes3);
    storageService.set.and.returnValue(Promise.resolve(null));

    authService.refreshEou().subscribe((res) => {
      expect(res).toEqual(eouRes3);
      expect(apiService.get).toHaveBeenCalledOnceWith('/eous/current');
      expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(eouFlattended);
      expect(storageService.set).toHaveBeenCalledOnceWith('user', eouRes3);
      done();
    });
  });

  describe('getRoles():', () => {
    it('should get roles from access token', (done) => {
      const roles = ['ADMIN', 'APPROVER', 'FYLER', 'HOP', 'HOD', 'OWNER'];
      tokenService.getAccessToken.and.returnValue(Promise.resolve(access_token));
      jwtHelperService.decodeToken.and.returnValue(apiAccessTokenRes);
      spyOn(JSON, 'parse').and.returnValue(roles);

      authService.getRoles().subscribe((res) => {
        expect(res).toEqual(roles);
        expect(tokenService.getAccessToken).toHaveBeenCalledTimes(1);
        expect(jwtHelperService.decodeToken).toHaveBeenCalledOnceWith(access_token);
        expect(JSON.parse).toHaveBeenCalledOnceWith(apiAccessTokenRes.roles);
        done();
      });
    });

    it('return empty array if token no received', (done) => {
      tokenService.getAccessToken.and.returnValue(Promise.resolve(null));

      authService.getRoles().subscribe((res) => {
        expect(res).toEqual([]);
        done();
      });
    });
  });

  it('resendEmailVerification(): should send email verfication', (done) => {
    const clusterDomain = {
      cluster_domain: 'https://staging.fyle.tech',
    };
    const email = 'ajain@fyle.in';
    const org_id = 'orNVthTo2Zyo';
    apiService.post.and.returnValue(of(clusterDomain));

    authService.resendEmailVerification(email, org_id).subscribe((res) => {
      expect(res).toEqual(clusterDomain);
      expect(apiService.post).toHaveBeenCalledOnceWith('/auth/resend_email_verification', { email, org_id });
      done();
    });
  });

  it('logout(): should logout a user', (done) => {
    const payload = {
      device_id: 'cfffc3e5-e975-42c6-9cde-d3ec892703d0',
      user_id: 'usvKA4X8Ugcr',
    };

    apiService.post.withArgs('/auth/logout', payload).and.returnValue(of(true));
    apiService.post.withArgs('/auth/logout').and.returnValue(of(true));

    authService.logout(payload).pipe(
      tap((res) => {
        expect(res).toBeTruthy();
        expect(apiService.post).toHaveBeenCalledWith('/auth/logout');
        expect(apiService.post).toHaveBeenCalledWith('/auth/logout', payload);
        expect(apiService.post).toHaveBeenCalledTimes(2);
      }),
      finalize(() => {
        expect(storageService.delete).toHaveBeenCalledWith('recentlyUsedProjects');
        expect(storageService.delete).toHaveBeenCalledWith('recentlyUsedCategories');
        expect(storageService.delete).toHaveBeenCalledWith('recentlyUsedMileageCategories');
        expect(storageService.delete).toHaveBeenCalledWith('recentlyUsedPerDiemCategories');
        expect(storageService.delete).toHaveBeenCalledWith('recentlyUsedCostCenters');
        expect(storageService.delete).toHaveBeenCalledWith('user');
        expect(storageService.delete).toHaveBeenCalledWith('role');
        expect(storageService.delete).toHaveBeenCalledWith('currentView');
        expect(storageService.delete).toHaveBeenCalledWith('ui-grid-pagination-page-size');
        expect(storageService.delete).toHaveBeenCalledWith('ui-grid-pagination-page-number');
        expect(storageService.delete).toHaveBeenCalledWith('customExportFields');
        expect(storageService.delete).toHaveBeenCalledWith('lastLoggedInDelegatee');
        expect(storageService.delete).toHaveBeenCalledWith('lastLoggedInOrgQueue');
        expect(storageService.delete).toHaveBeenCalledWith('isSidenavCollapsed');
        expect(storageService.delete).toHaveBeenCalledTimes(12);
      })
    );

    done();
  });
});
