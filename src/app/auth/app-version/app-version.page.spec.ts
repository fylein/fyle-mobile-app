import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DeviceService } from 'src/app/core/services/device.service';

import { AppVersionPage } from './app-version.page';
import { noop, of } from 'rxjs';
import {
  extendedDeviceInfoMockData,
  extendedDeviceInfoMockData2,
} from 'src/app/core/mock-data/extended-device-info.data';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';

describe('AppVersionPage', () => {
  let component: AppVersionPage;
  let fixture: ComponentFixture<AppVersionPage>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let browserHandlerService: jasmine.SpyObj<BrowserHandlerService>;
  let platformHandlerService: jasmine.SpyObj<PlatformHandlerService>;
  const headerMsg = 'Your app version is outdated. Please update to the latest version to continue using Fyle.';

  beforeEach(waitForAsync(() => {
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const activatedRouteStubSpy = {
      snapshot: {
        params: {
          message: headerMsg,
        },
      },
    };
    const browserHandlerServiceSpy = jasmine.createSpyObj('BrowserHandlerService', ['openLinkWithWindowName']);
    const platformHandlerServiceSpy = jasmine.createSpyObj('PlatformHandlerService', ['registerBackButtonAction']);

    TestBed.configureTestingModule({
      declarations: [AppVersionPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStubSpy },
        { provide: BrowserHandlerService, useValue: browserHandlerServiceSpy },
        { provide: PlatformHandlerService, useValue: platformHandlerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppVersionPage);
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    activatedRouteStub = TestBed.inject(ActivatedRoute);
    browserHandlerService = TestBed.inject(BrowserHandlerService) as jasmine.SpyObj<BrowserHandlerService>;
    platformHandlerService = TestBed.inject(PlatformHandlerService) as jasmine.SpyObj<PlatformHandlerService>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should set header message from activated route snapshot and call registerBackButtonAction', () => {
    expect(component.message).toBe(headerMsg);
    expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
      BackButtonActionPriority.ABSOLUTE,
      noop
    );
  });

  it('should open Android app URL when updateApp is called for Android platform', fakeAsync(() => {
    deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData2));
    component.updateApp();

    expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(1);
    tick(1000);
    expect(browserHandlerService.openLinkWithWindowName).toHaveBeenCalledWith(
      '_system',
      'https://play.google.com/store/apps/details?id=com.ionicframework.fyle595781'
    );
  }));

  it('should open iOS app URL when updateApp is called for iOS platform', fakeAsync(() => {
    deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
    component.updateApp();

    expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(1);
    tick(1000);
    expect(browserHandlerService.openLinkWithWindowName).toHaveBeenCalledWith(
      '_system',
      'https://itunes.apple.com/in/app/fyle/id1137906166'
    );
  }));
});
