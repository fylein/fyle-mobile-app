import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { AppVersionService } from './app-version.service';
import { ApiService } from './api.service';
import { RouterApiService } from './router-api.service';
import { LoginInfoService } from './login-info.service';
import { AuthService } from './auth.service';
import { appVersionData1 } from '../mock-data/app-version.data';
import { of } from 'rxjs';
import { extendedDeviceInfoMockData } from '../mock-data/extended-device-info.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { environment } from 'src/environments/environment';

describe('AppVersionService', () => {
  let appVersionService: AppVersionService;
  let apiService: jasmine.SpyObj<ApiService>;
  let routerApiService: jasmine.SpyObj<RouterApiService>;
  let loginInfoService: jasmine.SpyObj<LoginInfoService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const routerApiServiceSpy = jasmine.createSpyObj('RouterApiService', ['post']);
    const loginInfoServiceSpy = jasmine.createSpyObj('LoginInfoService', ['getLastLoggedInVersion']);
    TestBed.configureTestingModule({
      providers: [
        AppVersionService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
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
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
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
  });

  it('get(): should get app version', (done) => {
    apiService.get.and.returnValue(of(appVersionData1));

    appVersionService.get('ios').subscribe((res) => {
      expect(res).toEqual(appVersionData1);
      expect(apiService.get).toHaveBeenCalledOnceWith('/version/app/IOS');
      done();
    });
  });

  it('post(): should update the app version', (done) => {
    apiService.post.and.returnValue(of(null));

    const data = {
      app_version: '5.50.0',
      device_platform: 'ios',
      platform_version: '5.50.0',
    };

    appVersionService.post(data).subscribe((res) => {
      expect(res).toBeNull();
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
    spyOn(appVersionService, 'post').and.returnValue(of(null));
    spyOn(appVersionService, 'get').and.returnValue(of(appVersionData1));
    spyOn(appVersionService, 'isVersionLower').and.returnValue(false);

    appVersionService.load(extendedDeviceInfoMockData);
    const data = {
      app_version: environment.LIVE_UPDATE_APP_VERSION,
      device_platform: extendedDeviceInfoMockData.operatingSystem,
      platform_version: extendedDeviceInfoMockData.osVersion,
    };

    appVersionService.load(extendedDeviceInfoMockData);
    expect(appVersionService.get).toHaveBeenCalledWith(extendedDeviceInfoMockData.operatingSystem);
    expect(appVersionService.get).toHaveBeenCalledTimes(2);
    expect(appVersionService.isVersionLower).toHaveBeenCalledWith(appVersionData1.app_version, data.app_version);
    done();
  });

  describe('load():', () => {
    it('should load device info when app version lower', (done) => {
      spyOn(appVersionService, 'post').and.returnValue(of(null));
      spyOn(appVersionService, 'get').and.returnValue(of({ ...appVersionData1, app_version: '1.10.1' }));
      spyOn(appVersionService, 'isVersionLower').and.returnValue(true);

      appVersionService.load(extendedDeviceInfoMockData);
      const data = {
        app_version: environment.LIVE_UPDATE_APP_VERSION,
        device_platform: extendedDeviceInfoMockData.operatingSystem,
        platform_version: extendedDeviceInfoMockData.osVersion,
      };
      expect(appVersionService.get).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData.operatingSystem);
      expect(appVersionService.isVersionLower).toHaveBeenCalledWith('1.10.1', data.app_version);
      done();
    });

    it('should load device info when app version not present', (done) => {
      spyOn(appVersionService, 'post').and.returnValue(of(null));
      spyOn(appVersionService, 'get').and.returnValue(of(null));
      spyOn(appVersionService, 'isVersionLower').and.returnValue(true);

      appVersionService.load(extendedDeviceInfoMockData);
      expect(appVersionService.get).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData.operatingSystem);
      done();
    });
  });

  it("getUserAppVersionDetails(): should get user's app version details", fakeAsync(() => {
    spyOn(appVersionService, 'isSupported').and.returnValue(of({ supported: true }));
    loginInfoService.getLastLoggedInVersion.and.returnValue(of('5.50.0'));
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));

    tick();
    appVersionService.getUserAppVersionDetails(extendedDeviceInfoMockData);
    expect(appVersionService.isSupported).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData);
    expect(loginInfoService.getLastLoggedInVersion).toHaveBeenCalledTimes(1);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
  }));
});
