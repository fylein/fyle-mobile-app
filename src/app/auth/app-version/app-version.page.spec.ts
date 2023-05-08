import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { DeviceService } from 'src/app/core/services/device.service';

import { AppVersionPage } from './app-version.page';

describe('AppVersionPage', () => {
  let component: AppVersionPage;
  let fixture: ComponentFixture<AppVersionPage>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
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
    TestBed.configureTestingModule({
      declarations: [AppVersionPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStubSpy },
        Platform,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppVersionPage);
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    activatedRouteStub = TestBed.inject(ActivatedRoute);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set header message from activated route snapshot', () => {
    expect(component.message).toBe(headerMsg);
  });
});
