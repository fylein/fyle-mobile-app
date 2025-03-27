import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { TokenService } from './token.service';
import { StorageService } from './storage.service';
import { SecureStorageService } from './secure-storage.service';
import { RouterAuthService } from './router-auth.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TIMEZONE } from 'src/app/constants';
import { orgUserSettingsData } from '../mock-data/org-user-settings.data';
import { BehaviorSubject, of } from 'rxjs';

describe('ConfigService', () => {
  let configService: ConfigService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let secureStorageService: jasmine.SpyObj<SecureStorageService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['clearAll']);
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['clearAll']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['setClusterDomain']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: SecureStorageService, useValue: secureStorageServiceSpy },
        { provide: RouterAuthService, useValue: routerAuthServiceSpy },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: TIMEZONE, useValue: new BehaviorSubject<string>('UTC') },
      ],
    });
    configService = TestBed.inject(ConfigService);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    // @ts-ignore
    configService.timezone$ = new BehaviorSubject<string>('UTC');
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
