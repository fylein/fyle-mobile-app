import { TestBed } from '@angular/core/testing';
import { HttpConfigInterceptor } from './httpInterceptor';
import { JwtHelperService } from '../services/jwt-helper.service';
import { TokenService } from '../services/token.service';
import { RouterAuthService } from '../services/router-auth.service';
import { DeviceService } from '../services/device.service';
import { UserEventService } from '../services/user-event.service';
import { StorageService } from '../services/storage.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { apiAuthRes, authResData2 } from '../mock-data/auth-reponse.data';
import { BehaviorSubject, of } from 'rxjs';

describe('HttpConfigInterceptor', () => {
  let httpInterceptor: HttpConfigInterceptor;
  let jwtHelperService: jasmine.SpyObj<JwtHelperService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let secureStorageService: jasmine.SpyObj<SecureStorageService>;

  beforeEach(() => {
    const jwtHelperServiceSpy = jasmine.createSpyObj('JwtHelperService', ['getExpirationDate']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getRefreshToken', 'getAccessToken']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['fetchAccessToken', 'newAccessToken']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['logout']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['clearAll']);
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['clearAll']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpConfigInterceptor,
        {
          provide: JwtHelperService,
          useValue: jwtHelperServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: RouterAuthService,
          useValue: routerAuthServiceSpy,
        },
        {
          provide: DeviceService,
          useValue: deviceServiceSpy,
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: SecureStorageService,
          useValue: secureStorageServiceSpy,
        },
      ],
    });

    httpInterceptor = TestBed.inject(HttpConfigInterceptor);
    jwtHelperService = TestBed.inject(JwtHelperService) as jasmine.SpyObj<JwtHelperService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
  });

  it('should be created', () => {
    expect(httpInterceptor).toBeTruthy();
  });

  describe('secureUrl():', () => {
    it('should return true for a secure URL', () => {
      const result = httpInterceptor.secureUrl('https://staging1.fyle.tech/app/api/auth/logout');

      expect(result).toBeTrue();
    });

    it('should return true if the application is running on local, prod or staging', () => {
      const result = httpInterceptor.secureUrl('localhost:8100/app/dashboard');

      expect(result).toBeTrue();
    });

    it("should return false if the application isn't running on staging or prod", () => {
      const result = httpInterceptor.secureUrl('www.fyle.com');

      expect(result).toBeFalse();
    });

    it('should return false if URL does not contain logout ', () => {
      const result = httpInterceptor.secureUrl('https://staging1.fyle.tech/app/api/auth/login');

      expect(result).toBeFalse();
    });
  });

  it('expiringSoon(): should check if token is expiring soon', () => {
    jwtHelperService.getExpirationDate.and.returnValue(new Date('2023-03-03T06:50:11.644Z'));

    const result = httpInterceptor.expiringSoon(authResData2.accessToken);
    expect(result).toBeTrue();
  });

  describe('refreshAccessToken():', () => {
    it('should refresh access token', (done) => {
      tokenService.getRefreshToken.and.resolveTo(apiAuthRes.refresh_token);
      routerAuthService.fetchAccessToken.and.resolveTo(authResData2);
      routerAuthService.newAccessToken.and.resolveTo();
      tokenService.getAccessToken.and.resolveTo(authResData2.accessToken);

      httpInterceptor.refreshAccessToken().subscribe((res) => {
        expect(res).toEqual(authResData2.accessToken);
        expect(tokenService.getRefreshToken).toHaveBeenCalledTimes(1);
        expect(routerAuthService.fetchAccessToken).toHaveBeenCalledOnceWith(apiAuthRes.refresh_token);
        expect(routerAuthService.newAccessToken).toHaveBeenCalledOnceWith(undefined);
        expect(tokenService.getAccessToken).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should clear all cache if access token cannot be fetched', (done) => {
      tokenService.getRefreshToken.and.resolveTo(apiAuthRes.refresh_token);
      routerAuthService.fetchAccessToken.and.rejectWith(new Error('error'));

      httpInterceptor.refreshAccessToken().subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          expect(userEventService.logout).toHaveBeenCalledTimes(1);
          expect(secureStorageService.clearAll).toHaveBeenCalledTimes(1);
          expect(storageService.clearAll).toHaveBeenCalledTimes(1);
          done();
        },
      });
    });
  });

  describe('getAccessToken():', () => {
    it('should get new access token if it is expiring soon', (done) => {
      tokenService.getAccessToken.and.resolveTo(authResData2.accessToken);
      spyOn(httpInterceptor, 'expiringSoon').and.returnValue(true);
      spyOn(httpInterceptor.accessTokenSubject, 'next');
      spyOn(httpInterceptor, 'refreshAccessToken').and.returnValue(of(authResData2.accessToken));

      httpInterceptor.getAccessToken().subscribe((res) => {
        expect(res).toEqual(authResData2.accessToken);
        expect(tokenService.getAccessToken).toHaveBeenCalledTimes(1);
        expect(httpInterceptor.expiringSoon).toHaveBeenCalledOnceWith(authResData2.accessToken);
        expect(httpInterceptor.refreshAccessToken).toHaveBeenCalledTimes(1);
        expect(httpInterceptor.accessTokenSubject.next).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should return the access token if there is time till the token expires', (done) => {
      tokenService.getAccessToken.and.resolveTo(authResData2.accessToken);
      spyOn(httpInterceptor, 'expiringSoon').and.returnValue(false);

      httpInterceptor.getAccessToken().subscribe((res) => {
        expect(res).toEqual(authResData2.accessToken);
        expect(tokenService.getAccessToken).toHaveBeenCalledTimes(1);
        expect(httpInterceptor.expiringSoon).toHaveBeenCalledOnceWith(authResData2.accessToken);
        done();
      });
    });

    it('should return access token if an API call is in progress', (done) => {
      tokenService.getAccessToken.and.resolveTo(authResData2.accessToken);
      httpInterceptor.accessTokenCallInProgress = true;
      spyOn(httpInterceptor, 'expiringSoon').and.returnValue(true);
      httpInterceptor.accessTokenSubject = new BehaviorSubject(authResData2.accessToken);

      httpInterceptor.getAccessToken().subscribe((res) => {
        expect(res).toEqual(authResData2.accessToken);
        expect(tokenService.getAccessToken).toHaveBeenCalledTimes(2);
        expect(httpInterceptor.expiringSoon).toHaveBeenCalledOnceWith(authResData2.accessToken);
        done();
      });
    });
  });
});
