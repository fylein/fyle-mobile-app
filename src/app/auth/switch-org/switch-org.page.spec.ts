import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { StorageService } from 'src/app/core/services/storage.service';
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
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { finalize, of } from 'rxjs';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';

const roles = ['OWNER', 'USER', 'FYLER'];

fdescribe('SwitchOrgPage', () => {
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
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'getRoles', 'logout']);
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['clearAll']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['clearAll']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', [
      'getOrgs',
      'getCurrentOrg',
      'getPrimaryOrg',
      'switchOrg',
    ]);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['clearTaskCache', 'logout']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', [
      'clearRecentLocalStorageCache',
    ]);

    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'showToastMessage',
      'eventTrack',
      'onSwitchOrg',
      'switchOrgLaunchTime',
    ]);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['markActive']);
    const appVersionServiceSpy = jasmine.createSpyObj('AppVersionService', ['load', 'getUserAppVersionDetails']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['resendVerificationLink']);

    TestBed.configureTestingModule({
      declarations: [SwitchOrgPage],
      imports: [
        IonicModule.forRoot(),
        MatIconTestingModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        ChangeDetectorRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                navigate_back: '',
                choose: '',
                invite_link: '',
              },
            },
          },
        },
        {
          provide: Platform,
          useValue: platformSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: UserService,
          useValue: userServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: SecureStorageService,
          useValue: secureStorageServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: OrgService,
          useValue: orgServiceSpy,
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
        {
          provide: RecentLocalStorageItemsService,
          useValue: recentLocalStorageItemsServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: DeviceService,
          useValue: deviceServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
        {
          provide: AppVersionService,
          useValue: appVersionServiceSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesSpy,
        },
        {
          provide: RouterAuthService,
          useValue: routerAuthServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SwitchOrgPage);
    component = fixture.componentInstance;

    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    cdRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    appVersionService = TestBed.inject(AppVersionService) as jasmine.SpyObj<AppVersionService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('ionViewWillEnter', () => {});

  xit('setSentryUser(): should set sentry user', () => {
    component.setSentryUser(apiEouRes);
  });

  it('resendInvite(): should resend invite to an org', (done) => {
    const response = {
      cluster_domain: 'app_fyle',
    };
    routerAuthService.resendVerificationLink.and.returnValue(of(response));
    const email = 'ajain@fyle.in';
    const org_id = 'orNVthTo2Zyo';

    component.resendInvite(email, org_id).subscribe((res) => {
      expect(res).toEqual(response);
      expect(routerAuthService.resendVerificationLink).toHaveBeenCalledOnceWith(email, org_id);
      done();
    });
  });

  it('logoutIfSingleOrg(): should logout is a single org is present for the user', () => {
    spyOn(component, 'signOut');

    component.logoutIfSingleOrg(orgData1);
    expect(component.signOut).toHaveBeenCalledTimes(1);
  });

  it('showToastNotification(): should show toast notification', () => {
    const msg = 'message';
    const props = {
      data: {
        icon: 'tick-square-filled',
        showCloseButton: true,
        message: msg,
      },
      duration: 3000,
    };
    matSnackBar.openFromComponent.and.callThrough();
    snackbarProperties.setSnackbarProperties.and.returnValue(props);

    component.showToastNotification(msg);
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...props,
      panelClass: ['msb-info'],
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: msg });
  });

  xit('handleDismissPopup', () => {});

  it('showEmailNotVerifiedAlert(): should show email not verified alert', async () => {
    spyOn(component, 'handleDismissPopup').and.stub();
    const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
    popoverSpy.onWillDismiss.and.returnValue(
      Promise.resolve({
        data: {
          action: 'action',
        },
      })
    );
    popoverController.create.and.returnValue(Promise.resolve(popoverSpy));
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    component.orgs$ = of(orgData1);
    fixture.detectChanges();

    await component.showEmailNotVerifiedAlert();
    expect(popoverController.create).toHaveBeenCalledOnceWith({
      componentProps: {
        title: 'Invite Not Accepted',
        message: `You have been invited to ${apiEouRes.ou.org_name} organization, please check your previous emails and accept the invite or resend invite.`,
        primaryCta: {
          text: 'Resend Invite',
          action: 'resend',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'close',
        },
      },
      component: PopupAlertComponent,
      cssClass: 'pop-up-in-center',
      backdropDismiss: false,
    });
  });

  describe('navigateToSetupPage():', () => {
    it('should navigate to setup page if org the roles has OWNER', () => {
      component.navigateToSetupPage(['OWNER']);

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'post_verification', 'setup_account']);
    });

    it('should navigate to invite user if OWNER role is not present', () => {
      component.navigateToSetupPage(['ADMIN']);

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'post_verification', 'invited_user']);
    });
  });

  it('markUserActive(): should mark the user as active and return the org', async () => {
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());
    orgUserService.markActive.and.returnValue(of(apiEouRes));

    component
      .markUserActive()
      .pipe(
        finalize(() => {
          expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
          expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
        })
      )
      .subscribe((res) => {
        expect(res).toEqual(apiEouRes);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);

        expect(orgUserService.markActive).toHaveBeenCalledTimes(1);
      });
  });

  describe('handleInviteLinkFlow():', () => {
    it('should handle the flow if user has entered through invite link and navigate to setup page', (done) => {
      spyOn(component, 'navigateToSetupPage');

      userService.getUserPasswordStatus.and.returnValue(
        of({
          is_password_required: true,
          is_password_set: false,
        })
      );
      component.handleInviteLinkFlow(roles).subscribe((res) => {
        expect(res).toBeNull();
        expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
        expect(component.navigateToSetupPage).toHaveBeenCalledOnceWith(roles);
        done();
      });
    });

    it('should mark the user active if password is set', (done) => {
      spyOn(component, 'markUserActive').and.returnValue(of(apiEouRes));
      userService.getUserPasswordStatus.and.returnValue(
        of({
          is_password_required: true,
          is_password_set: true,
        })
      );

      component.handleInviteLinkFlow(roles).subscribe((res) => {
        expect(res).toEqual(apiEouRes);
        expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
        expect(component.markUserActive).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('handlePendingDetails():', () => {
    it('should handle flow if the user comes from invite link', (done) => {
      spyOn(component, 'handleInviteLinkFlow').and.returnValue(of(apiEouRes));

      component.handlePendingDetails(roles, true).subscribe((res) => {
        expect(res).toEqual(apiEouRes);
        expect(component.handleInviteLinkFlow).toHaveBeenCalledOnceWith(roles);
        done();
      });
    });

    it('should show email verification alert if the user has not come through invite link', (done) => {
      spyOn(component, 'showEmailNotVerifiedAlert').and.returnValue(Promise.resolve());

      component.handlePendingDetails(roles, false).subscribe((res) => {
        expect(res).toBeNull();
        expect(component.showEmailNotVerifiedAlert).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('navigateBasedOnUserStatus(): ', () => {
    it('should navigate to dashboard if status is active', (done) => {
      const config = {
        isPendingDetails: false,
        roles,
        eou: apiEouRes,
      };

      component.navigateBasedOnUserStatus(config).subscribe((res) => {
        expect(res).toBeNull();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
        done();
      });
    });

    it('should navigate to disbaled page if org is disbaled', (done) => {
      const config = {
        isPendingDetails: false,
        roles,
        eou: { ...apiEouRes, ou: { ...apiEouRes.ou, status: 'DISABLED' } },
      };

      component.navigateBasedOnUserStatus(config).subscribe((res) => {
        expect(res).toBeNull();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'disabled']);
        done();
      });
    });

    it('should handle flow if details are pending', (done) => {
      spyOn(component, 'handlePendingDetails').and.returnValue(of(apiEouRes));
      const config = {
        isPendingDetails: true,
        roles,
        eou: apiEouRes,
        isFromInviteLink: true,
      };

      component.navigateBasedOnUserStatus(config).subscribe((res) => {
        expect(res).toEqual(apiEouRes);
        expect(component.handlePendingDetails).toHaveBeenCalledOnceWith(config.roles, config.isFromInviteLink);
        done();
      });
    });
  });

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
