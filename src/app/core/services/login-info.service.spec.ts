import { TestBed } from '@angular/core/testing';
import { LoginInfoService } from './login-info.service';
import { StorageService } from './storage.service';

describe('LoginInfoService', () => {
  let loginInfoService: LoginInfoService;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    TestBed.configureTestingModule({
      providers: [
        LoginInfoService,
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
      ],
    });
    loginInfoService = TestBed.inject(LoginInfoService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  const version = '1.2.3';
  const time = new Date('2023-03-17T12:24:26.114Z');
  const loginInfo = {
    '1.2.3': [time],
    lastLoggedInVersion: '1.2.3',
    lastLoggedInTime: 'Fri, 17 Mar 2023 12:24:26 GMT',
  };

  it('should be created', () => {
    expect(loginInfoService).toBeTruthy();
  });

  describe('addLoginInfo():', () => {
    it('should add login info', async () => {
      storageService.get.and.returnValue(Promise.resolve(null));
      storageService.set.and.callThrough();

      loginInfoService.addLoginInfo(version, time);
      await expect(storageService.get).toHaveBeenCalledOnceWith('loginInfo');
      await expect(storageService.set).toHaveBeenCalledOnceWith('loginInfo', loginInfo);
    });

    it('should add login info when last login time is older than current time', async () => {
      const newTime = new Date('2023-03-20T12:24:26.114Z');
      const newLoginInfo = {
        '1.2.3': [time],
        lastLoggedInVersion: '1.2.3',
        lastLoggedInTime: 'Fri, 17 Mar 2023 12:24:26 GMT',
      };

      storageService.get.and.returnValue(Promise.resolve(newLoginInfo));
      storageService.set.and.callThrough();

      loginInfoService.addLoginInfo(version, newTime);
      await expect(storageService.get).toHaveBeenCalledOnceWith('loginInfo');
      await expect(storageService.set).toHaveBeenCalledOnceWith('loginInfo', newLoginInfo);
    });
  });

  describe('getLastLoggedInVersion():', () => {
    it('should get last logged in version', (done) => {
      storageService.get.and.returnValue(Promise.resolve(null));

      loginInfoService.getLastLoggedInVersion().subscribe((res) => {
        expect(res).toBeUndefined();
        expect(storageService.get).toHaveBeenCalledOnceWith('loginInfo');
        done();
      });
    });

    it('should return null if last logged in version not present', (done) => {
      storageService.get.and.returnValue(Promise.resolve(loginInfo));

      loginInfoService.getLastLoggedInVersion().subscribe((res) => {
        expect(res).toEqual(loginInfo.lastLoggedInVersion);
        expect(storageService.get).toHaveBeenCalledOnceWith('loginInfo');
        done();
      });
    });
  });
});
