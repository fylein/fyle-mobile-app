import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { TokenService } from './token.service';
import { StorageService } from './storage.service';
import { SecureStorageService } from './secure-storage.service';
import { RouterAuthService } from './router-auth.service';

describe('ConfigService', () => {
  let configService: ConfigService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let secureStorageService: jasmine.SpyObj<SecureStorageService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['clearAll']);
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['clearAll']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['setClusterDomain']);
    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: SecureStorageService, useValue: secureStorageServiceSpy },
        { provide: RouterAuthService, useValue: routerAuthServiceSpy },
      ],
    });
    configService = TestBed.inject(ConfigService);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
  });

  it('should be created', () => {
    expect(configService).toBeTruthy();
  });

  describe('loadConfigurationData', () => {
    it('should call setClusterDomain if clusterDomain is present', async () => {
      const clusterDomain = 'https://staging.fyle.tech';
      tokenService.getClusterDomain.and.resolveTo(clusterDomain);
      await configService.loadConfigurationData();
      expect(routerAuthService.setClusterDomain).toHaveBeenCalledOnceWith(clusterDomain);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
    });

    it('should clear all stored data if clusterDomain is not present', async () => {
      tokenService.getClusterDomain.and.resolveTo(null);
      await configService.loadConfigurationData();
      expect(storageService.clearAll).toHaveBeenCalledTimes(1);
      expect(secureStorageService.clearAll).toHaveBeenCalledTimes(1);
    });
  });
});
