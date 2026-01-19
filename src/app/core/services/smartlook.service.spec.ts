import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Smartlook } from '@awesome-cordova-plugins/smartlook/ngx';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { CurrencyService } from './currency.service';
import { DeviceService } from './device.service';
import { NetworkService } from './network.service';
import { extendedDeviceInfoMockData } from '../mock-data/extended-device-info.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { cloneDeep } from 'lodash';

import { SmartlookService } from './smartlook.service';

describe('SmartlookService', () => {
  let smartLookService: SmartlookService;
  let networkService: jasmine.SpyObj<NetworkService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let authService: jasmine.SpyObj<AuthService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let smartlook: jasmine.SpyObj<Smartlook>;

  beforeEach(() => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const smartlookSpy = jasmine.createSpyObj('Smartlook', [
      'setProjectKey',
      'start',
      'setUserIdentifier',
      'setUserProperty',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SmartlookService,
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: Smartlook, useValue: smartlookSpy },
      ],
    });
    smartLookService = TestBed.inject(SmartlookService);
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    smartlook = TestBed.inject(Smartlook) as jasmine.SpyObj<Smartlook>;
  });

  it('should be created', () => {
    expect(smartLookService).toBeTruthy();
  });

  it('setupNetworkWatcher(): should setup a network watcher', () => {
    const emitterSpy = jasmine.createSpyObj('EventEmitter', ['asObservable']);
    emitterSpy.asObservable.and.returnValue(of(true));
    smartLookService.setupNetworkWatcher();
    networkService.isOnline.and.returnValue(of(true));
    expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(2);
    expect(networkService.isOnline).toHaveBeenCalledTimes(2);
  });

  describe('init():', () => {
    beforeEach(() => {
      networkService.isOnline.and.returnValue(of(true));
      smartLookService.setupNetworkWatcher();
    });

    it('should initialize Smartlook when all conditions are met', fakeAsync(() => {
      const mockEou = cloneDeep(apiEouRes);
      mockEou.us.email = 'test@example.com';

      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      authService.getEou.and.resolveTo(mockEou);
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));

      smartLookService.init();
      tick();

      expect(smartlook.setProjectKey).toHaveBeenCalledTimes(1);
      expect(smartlook.start).toHaveBeenCalledTimes(1);
      expect(smartlook.setUserIdentifier).toHaveBeenCalledOnceWith({ identifier: mockEou.us.id });
      expect(smartlook.setUserProperty).toHaveBeenCalledWith({ propertyName: 'id', value: mockEou.us.id });
      expect(smartlook.setUserProperty).toHaveBeenCalledWith({
        propertyName: 'org_id',
        value: mockEou.ou.org_id,
      });
      expect(smartlook.setUserProperty).toHaveBeenCalledWith({
        propertyName: 'devicePlatform',
        value: extendedDeviceInfoMockData.platform,
      });
      expect(smartlook.setUserProperty).toHaveBeenCalledWith({
        propertyName: 'deviceModel',
        value: extendedDeviceInfoMockData.model,
      });
      expect(smartlook.setUserProperty).toHaveBeenCalledWith({
        propertyName: 'deviceOS',
        value: extendedDeviceInfoMockData.osVersion,
      });
      expect(smartlook.setUserProperty).toHaveBeenCalledWith({ propertyName: 'is_approver', value: 'true' });
    }));

    it('should set is_approver to false when user does not have APPROVER role', fakeAsync(() => {
      const mockEou = cloneDeep(apiEouRes);
      mockEou.us.email = 'test@example.com';
      mockEou.ou.roles = ['FYLER'];

      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      authService.getEou.and.resolveTo(mockEou);
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));

      smartLookService.init();
      tick();

      expect(smartlook.setUserProperty).toHaveBeenCalledWith({ propertyName: 'is_approver', value: 'false' });
    }));

    it('should not initialize Smartlook when user is offline', fakeAsync(() => {
      const mockEou = cloneDeep(apiEouRes);
      mockEou.us.email = 'test@example.com';

      networkService.isOnline.and.returnValue(of(false));
      smartLookService.setupNetworkWatcher();
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      authService.getEou.and.resolveTo(mockEou);
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));

      smartLookService.init();
      tick();

      expect(smartlook.setProjectKey).not.toHaveBeenCalled();
      expect(smartlook.start).not.toHaveBeenCalled();
    }));

    it('should not initialize Smartlook when user email contains fyle', fakeAsync(() => {
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      authService.getEou.and.resolveTo(apiEouRes);
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));

      smartLookService.init();
      tick();

      expect(smartlook.setProjectKey).not.toHaveBeenCalled();
      expect(smartlook.start).not.toHaveBeenCalled();
    }));

    it('should not initialize Smartlook when home currency is not USD', fakeAsync(() => {
      const mockEou = cloneDeep(apiEouRes);
      mockEou.us.email = 'test@example.com';

      currencyService.getHomeCurrency.and.returnValue(of('INR'));
      authService.getEou.and.resolveTo(mockEou);
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));

      smartLookService.init();
      tick();

      expect(smartlook.setProjectKey).not.toHaveBeenCalled();
      expect(smartlook.start).not.toHaveBeenCalled();
    }));

    it('should not initialize Smartlook when eou is null', fakeAsync(() => {
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      authService.getEou.and.resolveTo(null);
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));

      smartLookService.init();
      tick();

      expect(smartlook.setProjectKey).not.toHaveBeenCalled();
      expect(smartlook.start).not.toHaveBeenCalled();
    }));
  });
});
