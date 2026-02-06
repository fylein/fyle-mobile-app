import { TestBed } from '@angular/core/testing';
import { AppVersionService } from './app-version.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { RouterApiService } from './router-api.service';
import { LoginInfoService } from './login-info.service';
import { AuthService } from './auth.service';
import { appVersionData1, appVersionPostResponse, appVersionResponse } from '../mock-data/app-version.data';
import { of } from 'rxjs';
import { extendedDeviceInfoMockData } from '../mock-data/extended-device-info.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { environment } from 'src/environments/environment';

describe('AppVersionService', () => {
  let appVersionService: AppVersionService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let routerApiService: jasmine.SpyObj<RouterApiService>;
  let loginInfoService: jasmine.SpyObj<LoginInfoService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'refreshEou']);
    const routerApiServiceSpy = jasmine.createSpyObj('RouterApiService', ['post']);
    const loginInfoServiceSpy = jasmine.createSpyObj('LoginInfoService', ['getLastLoggedInVersion']);
    TestBed.configureTestingModule({
      providers: [
        AppVersionService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: RouterApiService,
          useValue: routerApiServiceSpy,
        },
        {
          provide: LoginInfoService,
          useValue: loginInfoServiceSpy,
        },
      ],
    });
    appVersionService = TestBed.inject(AppVersionService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loginInfoService = TestBed.inject(LoginInfoService) as jasmine.SpyObj<LoginInfoService>;
    routerApiService = TestBed.inject(RouterApiService) as jasmine.SpyObj<RouterApiService>;
  });

  it('should be created', () => {
    expect(appVersionService).toBeTruthy();
  });

  describe('isVersionLower():', () => {
    it('should check if a mobile app version is lower than other', () => {
      expect(appVersionService.isVersionLower('5.57.0', '5.56.0')).toBeFalse();
    });

    it('should return true if version1 is undefined', () => {
      expect(appVersionService.isVersionLower(undefined, '5.56.0')).toBeTrue();
    });

    it('should return true if version1 has no digit after decimal in version number', () => {
      expect(appVersionService.isVersionLower('5.56.', '5.56.5')).toBeTrue();
    });

    it('should return false if version2 has no digit after decimal in version number', () => {
      expect(appVersionService.isVersionLower('5.56.5', '5.56.')).toBeFalse();
    });

    it('should return false if version1 and version2 are empty strings', () => {
      expect(appVersionService.isVersionLower('', '')).toBeFalse();
    });
  });

  it('get(): should get app version', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(appVersionResponse));

    appVersionService.get('ios').subscribe((res) => {
      expect(res).toEqual(appVersionResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/mobile_app/versions', {
        params: { order: 'created_at.desc', 'os->name': 'eq.IOS', limit: 1 },
      });
      done();
    });
  });

  it('post(): should update the app version', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(appVersionPostResponse));

    const payload = {
      data: {
        version: '5.50.0',
        os: {
          name: 'ios',
          version: '5.50.0',
        },
      },
    };

    appVersionService.post(payload).subscribe((res) => {
      expect(res).toEqual(appVersionPostResponse);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/mobile_app/versions', payload);
      done();
    });
  });

  it('isSupported(): check if device is supported', (done) => {
    routerApiService.post.and.returnValue(of({ supported: true }));

    appVersionService.isSupported(extendedDeviceInfoMockData).subscribe((res) => {
      expect(res.supported).toBeTrue();
      done();
    });
  });

  it('should load device info', (done) => {
    spyOn(appVersionService, 'post').and.returnValue(of(appVersionPostResponse));
    spyOn(appVersionService, 'get').and.returnValue(of(appVersionResponse));
    spyOn(appVersionService, 'isVersionLower').and.returnValue(false);

    appVersionService.load(extendedDeviceInfoMockData);
    const payload = {
      data: {
        version: environment.LIVE_UPDATE_APP_VERSION,
        os: {
          name: extendedDeviceInfoMockData.operatingSystem.toUpperCase(),
          version: extendedDeviceInfoMockData.osVersion,
        },
      },
    };

    appVersionService.load(extendedDeviceInfoMockData);
    expect(appVersionService.get).toHaveBeenCalledWith(extendedDeviceInfoMockData.operatingSystem.toUpperCase());
    expect(appVersionService.get).toHaveBeenCalledTimes(2);
    expect(appVersionService.isVersionLower).toHaveBeenCalledWith(appVersionData1.version, payload.data.version);
    done();
  });

  describe('load():', () => {
    it('should load device info when app version lower', (done) => {
      spyOn(appVersionService, 'post').and.returnValue(of(appVersionPostResponse));
      spyOn(appVersionService, 'get').and.returnValue(
        of({ ...appVersionResponse, data: [{ ...appVersionData1, version: '1.10.1' }] }),
      );
      spyOn(appVersionService, 'isVersionLower').and.returnValue(true);

      appVersionService.load(extendedDeviceInfoMockData);
      const payload = {
        data: {
          version: environment.LIVE_UPDATE_APP_VERSION,
          os: {
            name: extendedDeviceInfoMockData.operatingSystem.toUpperCase(),
            version: extendedDeviceInfoMockData.osVersion,
          },
        },
      };
      expect(appVersionService.get).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData.operatingSystem.toUpperCase());
      expect(appVersionService.isVersionLower).toHaveBeenCalledWith('1.10.1', payload.data.version);
      done();
    });

    it('should load device info when app version not present', (done) => {
      spyOn(appVersionService, 'post').and.returnValue(of(appVersionPostResponse));
      spyOn(appVersionService, 'get').and.returnValue(of({ count: 0, offset: 0, data: [] }));
      spyOn(appVersionService, 'isVersionLower').and.returnValue(true);

      appVersionService.load(extendedDeviceInfoMockData);
      expect(appVersionService.get).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData.operatingSystem.toUpperCase());
      done();
    });
  });

  describe('getUserAppVersionDetails():', () => {
    beforeEach(() => {
      spyOn(appVersionService, 'isSupported').and.returnValue(of({ supported: true }));
      loginInfoService.getLastLoggedInVersion.and.returnValue(of('5.50.0'));
      authService.refreshEou.and.returnValue(of(apiEouRes));
    });

    it("getUserAppVersionDetails(): should get user's app version details", (done) => {
      appVersionService.getUserAppVersionDetails(extendedDeviceInfoMockData).subscribe(() => {
        expect(appVersionService.isSupported).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData);
        expect(loginInfoService.getLastLoggedInVersion).toHaveBeenCalledTimes(1);
        expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      });
      done();
    });

    it("getUserAppVersionDetails(): should get user's app version details if supported is false", (done) => {
      appVersionService.isSupported = jasmine.createSpy().and.returnValue(of({ supported: false }));
      appVersionService.getUserAppVersionDetails(extendedDeviceInfoMockData).subscribe(() => {
        expect(appVersionService.isSupported).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData);
        expect(loginInfoService.getLastLoggedInVersion).toHaveBeenCalledTimes(1);
        expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      });
      done();
    });
  });
});
