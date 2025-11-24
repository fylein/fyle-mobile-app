import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { TokenService } from './token.service';
import { StorageService } from './storage.service';
import { SecureStorageService } from './secure-storage.service';
import { RouterAuthService } from './router-auth.service';
import { PlatformOrgSettingsService } from './platform/v1/spender/org-settings.service';
import { of } from 'rxjs';
import { getFormatPreferenceProviders } from '../testing/format-preference-providers.utils';

describe('ConfigService', () => {
  let configService: ConfigService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let secureStorageService: jasmine.SpyObj<SecureStorageService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let orgSettingsService: jasmine.SpyObj<PlatformOrgSettingsService>;

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['clearAll']);
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['clearAll']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['setClusterDomain']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('PlatformOrgSettingsService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: SecureStorageService, useValue: secureStorageServiceSpy },
        { provide: RouterAuthService, useValue: routerAuthServiceSpy },
        { provide: PlatformOrgSettingsService, useValue: orgSettingsServiceSpy },
        ...getFormatPreferenceProviders(),
      ],
    });
    configService = TestBed.inject(ConfigService);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    orgSettingsService = TestBed.inject(PlatformOrgSettingsService) as jasmine.SpyObj<PlatformOrgSettingsService>;
  });

  it('should be created', () => {
    expect(configService).toBeTruthy();
  });

  describe('loadConfigurationData', () => {
    it('should call setClusterDomain if clusterDomain is present', async () => {
      const clusterDomain = 'https://staging.fyle.tech';
      tokenService.getClusterDomain.and.resolveTo(clusterDomain);
      orgSettingsService.get.and.returnValue(
        of({
          regional_settings: {
            allowed: true,
            enabled: true,
            time_format: 'h:mm a',
            date_format: 'MMM dd, yyyy',
            currency_format: {
              decimal_separator: '.',
              thousand_separator: ',',
              symbol_position: 'before',
            },
          },
        }),
      );
      await configService.loadConfigurationData();
      expect(routerAuthService.setClusterDomain).toHaveBeenCalledOnceWith(clusterDomain);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
    });

    it('should clear all stored data if clusterDomain is not present', async () => {
      tokenService.getClusterDomain.and.resolveTo(null);
      orgSettingsService.get.and.returnValue(
        of({
          regional_settings: {
            allowed: true,
            enabled: true,
            time_format: 'h:mm a',
            date_format: 'MMM dd, yyyy',
            currency_format: {
              decimal_separator: '.',
              thousand_separator: ',',
              symbol_position: 'before',
            },
          },
        }),
      );
      await configService.loadConfigurationData();
      expect(storageService.clearAll).toHaveBeenCalledTimes(1);
      expect(secureStorageService.clearAll).toHaveBeenCalledTimes(1);
    });
  });
});
