import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { callbackify } from 'util';
import { SecureStorageService } from './secure-storage.service';

import { TokenService } from './token.service';
import { UserEventService } from './user-event.service';

describe('TokenService', () => {
  let tokenService: TokenService;
  let secureStorageService: jasmine.SpyObj<SecureStorageService>;
  let userEventService: jasmine.SpyObj<UserEventService>;

  beforeEach(() => {
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['get', 'set', 'delete']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['onLogout', 'setToken']);
    TestBed.configureTestingModule({
      providers: [
        TokenService,
        { provide: SecureStorageService, useValue: secureStorageServiceSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
      ],
    });
    tokenService = TestBed.inject(TokenService);
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
  });

  it('should be created', () => {
    expect(tokenService).toBeTruthy();
  });

  it('getAccessToken(): should get access token from secure storage', fakeAsync(() => {
    secureStorageService.get.and.returnValue(Promise.resolve('token'));
    tick();
    tokenService.getAccessToken().then((token) => {
      expect(token).toEqual('token');
      expect(secureStorageService.get).toHaveBeenCalledOnceWith('X-AUTH-TOKEN');
    });
  }));

  it('setAccessToken(): should set access token to secure storage', fakeAsync(() => {
    userEventService.setToken.and.returnValue(null);
    secureStorageService.set.and.returnValue(Promise.resolve({ value: true }));
    tick();
    tokenService.setAccessToken('token').then(() => {
      expect(secureStorageService.set).toHaveBeenCalledOnceWith('X-AUTH-TOKEN', 'token');
    });
  }));

  it('resetAccessToken(): should reset access token from secure storage', fakeAsync(() => {
    secureStorageService.delete.and.returnValue(Promise.resolve({ value: true }));
    tick();
    tokenService.resetAccessToken().then(() => {
      expect(secureStorageService.delete).toHaveBeenCalledOnceWith('X-AUTH-TOKEN');
    });
  }));

  it('getRefreshToken(): should get refresh token from secure storage', fakeAsync(() => {
    secureStorageService.get.and.returnValue(Promise.resolve('token'));
    tick();
    tokenService.getRefreshToken().then((token) => {
      expect(token).toEqual('token');
      expect(secureStorageService.get).toHaveBeenCalledOnceWith('X-REFRESH-TOKEN');
    });
  }));

  it('setRefreshToken(): should set refresh token to secure storage', fakeAsync(() => {
    secureStorageService.set.and.returnValue(Promise.resolve({ value: true }));
    tick();
    tokenService.setRefreshToken('token').then(() => {
      expect(secureStorageService.set).toHaveBeenCalledOnceWith('X-REFRESH-TOKEN', 'token');
    });
  }));

  it('resetRefreshToken(): should reset refresh token from secure storage', fakeAsync(() => {
    secureStorageService.delete.and.returnValue(Promise.resolve({ value: true }));
    tick();
    tokenService.resetRefreshToken().then(() => {
      expect(secureStorageService.delete).toHaveBeenCalledOnceWith('X-REFRESH-TOKEN');
    });
  }));

  it('getClusterDomain(): should get cluster domain from secure storage', fakeAsync(() => {
    secureStorageService.get.and.returnValue(Promise.resolve('domain'));
    tick();
    tokenService.getClusterDomain().then((domain) => {
      expect(domain).toEqual('domain');
      expect(secureStorageService.get).toHaveBeenCalledOnceWith('CLUSTER-DOMAIN');
    });
  }));

  it('setClusterDomain(): should set cluster domain to secure storage', fakeAsync(() => {
    secureStorageService.set.and.returnValue(Promise.resolve({ value: true }));
    tick();
    tokenService.setClusterDomain('domain').then(() => {
      expect(secureStorageService.set).toHaveBeenCalledOnceWith('CLUSTER-DOMAIN', 'domain');
    });
  }));

  it('resetClusterDomain(): should reset cluster domain from secure storage', fakeAsync(() => {
    secureStorageService.delete.and.returnValue(Promise.resolve({ value: true }));
    tick();
    tokenService.resetClusterDomain().then(() => {
      expect(secureStorageService.delete).toHaveBeenCalledOnceWith('CLUSTER-DOMAIN');
    });
  }));
});
