import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from '../../core/services/tracking.service';
import { OrgService } from 'src/app/core/services/org.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PopoverController } from '@ionic/angular';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { MyProfilePage } from './my-profile.page';
import { NO_ERRORS_SCHEMA } from '@angular/core';

fdescribe('MyProfilePage', () => {
  let component: MyProfilePage;
  let fixture: ComponentFixture<MyProfilePage>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let secureStorageService: jasmine.SpyObj<SecureStorageService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'refreshEou', 'logout']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get', 'post']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['logout']);
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['clearAll']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['clearAll']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['onSettingsToggle', 'showToastMessage']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);

    TestBed.configureTestingModule({
      declarations: [MyProfilePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
        { provide: SecureStorageService, useValue: secureStorageServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: OrgService, useValue: orgServiceSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MyProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('setupNetworkWatcher', () => {});

  xit('signOut', () => {});

  xit('ionViewWillEnter', () => {});

  xit('reset', () => {});

  xit('updateMobileNumber', () => {});

  xit('showToastMessage', () => {});
});
