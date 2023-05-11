import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgService } from 'src/app/core/services/org.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { AppVersionService } from 'src/app/core/services/app-version.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { SwitchOrgPage } from './switch-org.page';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';

xdescribe('SwitchOrgPage', () => {
  let component: SwitchOrgPage;
  let fixture: ComponentFixture<SwitchOrgPage>;
  let platform: jasmine.SpyObj<Platform>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let userService: jasmine.SpyObj<UserService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let authService: jasmine.SpyObj<AuthService>;
  let secureStorageService: jasmine.SpyObj<SecureStorageService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let router: jasmine.SpyObj<Router>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let cdRef: jasmine.SpyObj<ChangeDetectorRef>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let appVersionService: jasmine.SpyObj<AppVersionService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;

  beforeEach(waitForAsync(() => {
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserPasswordStatus', 'isPendingDetails']);
    const authServiceSpy = jasmine.createSpyObj('AuthService');
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService');
    const storageServiceSpy = jasmine.createSpyObj('StorageService');
    const routerSpy = jasmine.createSpyObj('Router');
    const networkServiceSpy = jasmine.createSpyObj('NetworkService');
    const orgServiceSpy = jasmine.createSpyObj('OrgService');
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService');
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService');
    const cdRefSpy = jasmine.createSpyObj('ChangeDetectorRef');
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService');
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService');
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController');
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService');
    const appVersionServiceSpy = jasmine.createSpyObj('AppVersionService');
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar');
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService');
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService');

    TestBed.configureTestingModule({
      declarations: [SwitchOrgPage],
      imports: [IonicModule.forRoot()],
      providers: [],
    }).compileComponents();
    fixture = TestBed.createComponent(SwitchOrgPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('ionViewWillEnter', () => {});

  xit('setSentryUser', () => {});

  xit('resendInvite', () => {});

  xit('showToastNotification', () => {});

  xit('handleDismissPopup', () => {});

  xit('showEmailNotVerifiedAlert', () => {});

  xit('navigateToSetupPage', () => {});

  xit('markUserActive', () => {});

  xit('handleInviteLinkFlow', () => {});

  xit('navigateBasedOnUserStatus', () => {});

  xit('proceed', () => {});

  xit('trackSwitchOrg', () => {});

  xit('switchOrg', () => {});

  xit('signOut', () => {});

  xit('getOrgsWhichContainSearchText', () => {});

  xit('resetSearch', () => {});

  xit('openSearchBar', () => {});

  xit('cancelSearch', () => {});

  xit('trackSwitchOrgLaunchTime', () => {});
});
