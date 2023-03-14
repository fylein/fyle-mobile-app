import { TestBed } from '@angular/core/testing';
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

  it('getAccessToken(): should get access token from secure storage', (done) => {
    secureStorageService.get.and.returnValue(Promise.resolve('token'));
    tokenService.getAccessToken().then((token) => {
      expect(token).toEqual('token');
      expect(secureStorageService.get).toHaveBeenCalledOnceWith('X-AUTH-TOKEN');
      done();
    });
  });

  it('setAccessToken(): should set access token to secure storage', (done) => {
    userEventService.setToken.and.returnValue();
    secureStorageService.set.and.returnValue(Promise.resolve({ value: true }));
    tokenService.setAccessToken('token').then(() => {
      expect(secureStorageService.set).toHaveBeenCalledOnceWith('X-AUTH-TOKEN', 'token');
      done();
    });
  });

  it('resetAccessToken(): should reset access token from secure storage', (done) => {
    secureStorageService.delete.and.returnValue(Promise.resolve({ value: true }));
    tokenService.resetAccessToken().then(() => {
      expect(secureStorageService.delete).toHaveBeenCalledOnceWith('X-AUTH-TOKEN');
      done();
    });
  });

  it('getRefreshToken(): should get refresh token from secure storage', (done) => {
    secureStorageService.get.and.returnValue(Promise.resolve('token'));
    tokenService.getRefreshToken().then((token) => {
      expect(token).toEqual('token');
      expect(secureStorageService.get).toHaveBeenCalledOnceWith('X-REFRESH-TOKEN');
      done();
    });
  });

  it('setRefreshToken(): should set refresh token to secure storage', (done) => {
    secureStorageService.set.and.returnValue(Promise.resolve({ value: true }));
    tokenService.setRefreshToken('token').then(() => {
      expect(secureStorageService.set).toHaveBeenCalledOnceWith('X-REFRESH-TOKEN', 'token');
      done();
    });
  });

  it('resetRefreshToken(): should reset refresh token from secure storage', (done) => {
    secureStorageService.delete.and.returnValue(Promise.resolve({ value: true }));
    tokenService.resetRefreshToken().then(() => {
      expect(secureStorageService.delete).toHaveBeenCalledOnceWith('X-REFRESH-TOKEN');
      done();
    });
  });

  it('getClusterDomain(): should get cluster domain from secure storage', (done) => {
    secureStorageService.get.and.returnValue(Promise.resolve('domain'));
    tokenService.getClusterDomain().then((domain) => {
      expect(domain).toEqual('domain');
      expect(secureStorageService.get).toHaveBeenCalledOnceWith('CLUSTER-DOMAIN');
      done();
    });
  });

  it('setClusterDomain(): should set cluster domain to secure storage', (done) => {
    secureStorageService.set.and.returnValue(Promise.resolve({ value: true }));
    tokenService.setClusterDomain('domain').then(() => {
      expect(secureStorageService.set).toHaveBeenCalledOnceWith('CLUSTER-DOMAIN', 'domain');
      done();
    });
  });

  it('resetClusterDomain(): should reset cluster domain from secure storage', (done) => {
    secureStorageService.delete.and.returnValue(Promise.resolve({ value: true }));
    tokenService.resetClusterDomain().then(() => {
      expect(secureStorageService.delete).toHaveBeenCalledOnceWith('CLUSTER-DOMAIN');
      done();
    });
  });
});
