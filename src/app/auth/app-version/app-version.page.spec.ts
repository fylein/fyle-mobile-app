import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { DeviceService } from 'src/app/core/services/device.service';

import { AppVersionPage } from './app-version.page';
import { of } from 'rxjs';
import {
  extendedDeviceInfoMockData,
  extendedDeviceInfoMockData2,
} from 'src/app/core/mock-data/extended-device-info.data';
import { AppVersionService } from 'src/app/core/services/app-version.service';

describe('AppVersionPage', () => {
  let component: AppVersionPage;
  let fixture: ComponentFixture<AppVersionPage>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let appVersionService: jasmine.SpyObj<AppVersionService>;
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
    const appVersionServiceSpy = jasmine.createSpyObj('AppVersionService', [
      'setBackButtonActionPriority',
      'openBrowser',
    ]);
    TestBed.configureTestingModule({
      declarations: [AppVersionPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStubSpy },
        { provide: AppVersionService, useValue: appVersionServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppVersionPage);
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    activatedRouteStub = TestBed.inject(ActivatedRoute);
    appVersionService = TestBed.inject(AppVersionService) as jasmine.SpyObj<AppVersionService>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set header message from activated route snapshot', () => {
    expect(component.message).toBe(headerMsg);
    expect(appVersionService.setBackButtonActionPriority).toHaveBeenCalledTimes(1);
  });

  it('should open Android app URL when updateApp is called for Android platform', fakeAsync(() => {
    deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData2));
    component.updateApp();

    expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(2);
    tick(1000);
    expect(appVersionService.openBrowser).toHaveBeenCalledWith({
      url: 'https://play.google.com/store/apps/details?id=com.ionicframework.fyle595781',
      windowName: '_system',
    });
  }));

  it('should open iOS app URL when updateApp is called for iOS platform', fakeAsync(() => {
    deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
    component.updateApp();

    expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(2);
    tick(1000);
    expect(appVersionService.openBrowser).toHaveBeenCalledWith({
      url: 'https://itunes.apple.com/in/app/fyle/id1137906166',
      windowName: '_system',
    });
  }));
});
