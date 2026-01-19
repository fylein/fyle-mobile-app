import { TestBed } from '@angular/core/testing';
import { Smartlook } from '@awesome-cordova-plugins/smartlook/ngx';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { CurrencyService } from './currency.service';
import { DeviceService } from './device.service';
import { NetworkService } from './network.service';

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
    const smartlookSpy = jasmine.createSpyObj('Smartlook', ['setupAndStartRecording', 'setUserIdentifier']);

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
});
