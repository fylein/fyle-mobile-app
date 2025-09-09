import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
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
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { finalize, of, throwError } from 'rxjs';
import { orgData1, orgData2 } from 'src/app/core/mock-data/org.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { authResData1 } from '../../core/mock-data/auth-response.data';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { By } from '@angular/platform-browser';
import { ActiveOrgCardComponent } from './active-org-card/active-org-card.component';
import { OrgCardComponent } from './org-card/org-card.component';
import { FyZeroStateComponent } from 'src/app/shared/components/fy-zero-state/fy-zero-state.component';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { DeepLinkService } from 'src/app/core/services/deep-link.service';
import { platformExpenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { transformedExpenseData } from 'src/app/core/mock-data/transformed-expense.data';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { orgSettingsCardsDisabled, orgSettingsData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

const roles = ['OWNER', 'USER', 'FYLER'];
const email = 'ajain@fyle.in';
const org_id = 'orNVthTo2Zyo';

describe('SwitchOrgPage', () => {
  let component: SwitchOrgPage;
  let fixture: ComponentFixture<SwitchOrgPage>;
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
  let trackingService: jasmine.SpyObj<TrackingService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let appVersionService: jasmine.SpyObj<AppVersionService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let deepLinkService: jasmine.SpyObj<DeepLinkService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let spenderOnboardingService: jasmine.SpyObj<SpenderOnboardingService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
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
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['markActive', 'getCurrent']);
    const appVersionServiceSpy = jasmine.createSpyObj('AppVersionService', ['load', 'getUserAppVersionDetails']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['resendVerificationLink']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['transformExpense']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById']);
    const deepLinkServiceSpy = jasmine.createSpyObj('DeepLinkService', ['getExpenseRoute']);
    const ldSpy = jasmine.createSpyObj('LaunchDarklyService', ['initializeUser']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'checkForRedirectionToOnboarding',
    ]);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
    imports: [
        IonicModule.forRoot(),
        MatIconTestingModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TranslocoModule,
        SwitchOrgPage, ActiveOrgCardComponent, OrgCardComponent, FyZeroStateComponent,
    ],
    providers: [
        UrlSerializer,
        ChangeDetectorRef,
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: {
                        navigate_back: false,
                        choose: JSON.stringify(true),
                        invite_link: JSON.stringify(true),
                    },
                },
            },
        },
        {
            provide: LaunchDarklyService,
            useValue: ldSpy,
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
            provide: OrgSettingsService,
            useValue: orgSettingsServiceSpy,
        },
        {
            provide: SpenderOnboardingService,
            useValue: spenderOnboardingServiceSpy,
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
        {
            provide: TransactionService,
            useValue: transactionServiceSpy,
        },
        {
            provide: ExpensesService,
            useValue: expensesServiceSpy,
        },
        {
            provide: DeepLinkService,
            useValue: deepLinkServiceSpy,
        },
        {
            provide: TranslocoService,
            useValue: translocoServiceSpy,
        },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();
    fixture = TestBed.createComponent(SwitchOrgPage);
    component = fixture.componentInstance;

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
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    appVersionService = TestBed.inject(AppVersionService) as jasmine.SpyObj<AppVersionService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    deepLinkService = TestBed.inject(DeepLinkService) as jasmine.SpyObj<DeepLinkService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService) as jasmine.SpyObj<SpenderOnboardingService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    component.searchRef = fixture.debugElement.query(By.css('#search'));
    component.searchOrgsInput = fixture.debugElement.query(By.css('.smartlook-show'));
    component.contentRef = fixture.debugElement.query(By.css('.switch-org__content-container__content-block'));
    fixture.detectChanges();
    spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter():', () => {
    beforeEach(() => {
      orgService.getOrgs.and.returnValue(of(orgData1));
      spyOn(component, 'getOrgsWhichContainSearchText').and.returnValue(orgData1);
      spyOn(component, 'proceed').and.resolveTo();
      spyOn(component, 'redirectToExpensePage').and.returnValue();
      orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
      orgService.getPrimaryOrg.and.returnValue(of(orgData2[1]));
      loaderService.showLoader.and.resolveTo();
      spyOn(component, 'trackSwitchOrgLaunchTime').and.returnValue(null);
    });

    it('should show orgs and setup search bar', fakeAsync(() => {
      component.searchOrgsInput.nativeElement.value = 'Staging Loaded';
      component.searchOrgsInput.nativeElement.dispatchEvent(new Event('keyup'));
      const changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
      const detectChangesSpy = spyOn(changeDetectorRef.constructor.prototype, 'detectChanges');
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(1000);

      component.filteredOrgs$.subscribe((res) => {
        expect(res).toEqual(orgData1);
      });

      expect(orgService.getOrgs).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
      expect(orgService.getPrimaryOrg).toHaveBeenCalledTimes(1);
      expect(component.orgs).toEqual(orgData1);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);

      expect(component.proceed).toHaveBeenCalledOnceWith(true);

      expect(component.getOrgsWhichContainSearchText).toHaveBeenCalledOnceWith([orgData2[1]], '');
      expect(detectChangesSpy).toHaveBeenCalledTimes(2);
    }));

    it('should directly proceed to invite line flow if choosing is disabled', fakeAsync(() => {
      activatedRoute.snapshot.params.choose = false;
      const changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
      const detectChangesSpy = spyOn(changeDetectorRef.constructor.prototype, 'detectChanges');
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(1000);

      component.searchOrgsInput.nativeElement.value = 'Staging Loaded';
      component.searchOrgsInput.nativeElement.dispatchEvent(new Event('keyup'));

      component.filteredOrgs$.subscribe((res) => {
        expect(res).toEqual(orgData1);
      });
      expect(orgService.getOrgs).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
      expect(orgService.getPrimaryOrg).toHaveBeenCalledTimes(1);
      expect(component.orgs).toEqual(orgData1);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);

      expect(component.proceed).toHaveBeenCalledOnceWith(true);
      expect(component.getOrgsWhichContainSearchText).toHaveBeenCalledOnceWith([orgData2[1]], '');
      expect(detectChangesSpy).toHaveBeenCalledTimes(2);
    }));

    it('should redirect to expense page if orgId and txnId are present in route params', () => {
      const orgId = 'orOTDe765hQp';
      const txnId = 'txMLI4Cc5zY5';
      activatedRoute.snapshot.params = {
        orgId,
        txnId,
      };
      component.ionViewWillEnter();

      expect(component.redirectToExpensePage).toHaveBeenCalledOnceWith(orgId, txnId);
    });
  });

  it('resendInvite(): should resend invite to an org', (done) => {
    const response = {
      cluster_domain: 'app_fyle',
    };
    routerAuthService.resendVerificationLink.and.returnValue(of(response));

    component.resendInvite(email, org_id).subscribe((res) => {
      expect(res).toEqual(response);
      expect(routerAuthService.resendVerificationLink).toHaveBeenCalledOnceWith(email, org_id);
      done();
    });
  });

  describe('redirectToExpensePage(): ', () => {
    beforeEach(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      orgService.switchOrg.and.returnValue(of(apiEouRes));
      userEventService.clearTaskCache.and.returnValue();
      recentLocalStorageItemsService.clearRecentLocalStorageCache.and.returnValue();
      authService.getEou.and.resolveTo(apiEouRes);
      expensesService.getExpenseById.and.returnValue(of(platformExpenseData));
      transactionService.transformExpense.and.returnValue(transformedExpenseData);
      deepLinkService.getExpenseRoute.and.returnValue(['/', 'enterprise', 'add_edit_expense']);

      spyOn(component, 'setSentryUser').and.returnValue();
      spyOn(globalCacheBusterNotifier, 'next').and.returnValue();
    });

    it('should redirect to expense page if txn found in org', fakeAsync(() => {
      const txnId = 'txvslh8aQMbu';
      const orgId = 'orNVthTo2Zyo';
      component.redirectToExpensePage(orgId, txnId);

      tick(200);

      expect(loaderService.showLoader).toHaveBeenCalledOnceWith();
      expect(orgService.switchOrg).toHaveBeenCalledOnceWith(orgId);

      expect(globalCacheBusterNotifier.next).toHaveBeenCalledOnceWith();
      expect(userEventService.clearTaskCache).toHaveBeenCalledOnceWith();
      expect(recentLocalStorageItemsService.clearRecentLocalStorageCache).toHaveBeenCalledOnceWith();
      expect(authService.getEou).toHaveBeenCalledOnceWith();

      expect(component.setSentryUser).toHaveBeenCalledOnceWith(apiEouRes);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(txnId);
      expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
      expect(loaderService.hideLoader).toHaveBeenCalledOnceWith();

      expect(deepLinkService.getExpenseRoute).toHaveBeenCalledOnceWith(transformedExpenseData);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'add_edit_expense', { id: txnId }]);
    }));

    it('should stay on switch org if there is some error', fakeAsync(() => {
      const txnId = 'tx3qHxFNgRcZ';
      const orgId = 'orNVthTo2Zyo';
      orgService.switchOrg.and.returnValue(throwError(() => {}));
      component.redirectToExpensePage(orgId, txnId);
      tick(200);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org']);
    }));
  });

  describe('logoutIfSingleOrg():', () => {
    it('should logout is a single org is present for the user', () => {
      spyOn(component, 'signOut');

      component.logoutIfSingleOrg(orgData1);
      expect(component.signOut).toHaveBeenCalledTimes(1);
    });

    it('should not call sign out if no orgs are present', () => {
      spyOn(component, 'signOut');

      component.logoutIfSingleOrg(null);
      expect(component.signOut).not.toHaveBeenCalled();
    });
  });

  it('showToastNotification(): should show toast notification', () => {
    const msg = 'message';
    const props = {
      data: {
        icon: 'check-square-fill',
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
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledTimes(1);
  });

  describe('handleDismissPopup(): ', () => {
    it('should dismiss popup', () => {
      spyOn(component, 'resendInvite').and.returnValue(of({ cluster_domain: authResData1.cluster_domain }));
      spyOn(component, 'showToastNotification');
      spyOn(component, 'logoutIfSingleOrg');

      component.handleDismissPopup('resend', email, org_id, orgData1);
      expect(component.resendInvite).toHaveBeenCalledOnceWith(email, org_id);
      expect(component.logoutIfSingleOrg).toHaveBeenCalledOnceWith(orgData1);
      expect(component.showToastNotification).toHaveBeenCalledOnceWith('Verification email sent');
    });

    it('should logout if action is cancel', () => {
      spyOn(component, 'logoutIfSingleOrg');

      component.handleDismissPopup(null, email, org_id, orgData1);
      expect(component.logoutIfSingleOrg).toHaveBeenCalledOnceWith(orgData1);
    });

    it('show error notification', () => {
      spyOn(component, 'resendInvite').and.returnValue(throwError(() => true));
      spyOn(component, 'showToastNotification');

      component.handleDismissPopup('resend', email, org_id, orgData1);
      expect(component.resendInvite).toHaveBeenCalledOnceWith(email, org_id);
      expect(component.showToastNotification).toHaveBeenCalledOnceWith(
        'Verification link could not be sent. Please try again!'
      );
    });
  });

  describe('showEmailNotVerifiedAlert(): ', () => {
    it('should show email not verified alert', fakeAsync(() => {
      spyOn(component, 'handleDismissPopup').and.returnValue(null);
      const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'action',
        },
      });
      popoverController.create.and.resolveTo(popoverSpy);
      authService.getEou.and.resolveTo(apiEouRes);
      component.orgs$ = of(orgData1);
      fixture.detectChanges();

      component.showEmailNotVerifiedAlert();
      tick(10000);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(component.handleDismissPopup).toHaveBeenCalledOnceWith('action', email, org_id, orgData1);
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        componentProps: {
          title: 'Invite not accepted',
          message: `You have been invited to ${apiEouRes.ou.org_name} organization, please check your previous emails and accept the invite or resend invite.`,
          primaryCta: {
            text: 'Resend invite',
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
    }));

    it('should show appropriate popup if action is not provided', fakeAsync(() => {
      spyOn(component, 'handleDismissPopup').and.returnValue(null);
      const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({
        data: undefined,
      });
      popoverController.create.and.resolveTo(popoverSpy);
      authService.getEou.and.resolveTo(apiEouRes);
      component.orgs$ = of(orgData1);
      fixture.detectChanges();

      component.showEmailNotVerifiedAlert();
      tick(10000);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(component.handleDismissPopup).toHaveBeenCalledOnceWith(undefined, email, org_id, orgData1);
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        componentProps: {
          title: 'Invite not accepted',
          message: `You have been invited to ${apiEouRes.ou.org_name} organization, please check your previous emails and accept the invite or resend invite.`,
          primaryCta: {
            text: 'Resend invite',
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
    }));
  });

  it('navigateToDashboard(): should navigate to spender onboarding when onboarding status is not complete', fakeAsync(() => {
    spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(true));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    component.navigateToDashboard();
    tick();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'spender_onboarding']);
  }));

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

  it('markUserActive(): should mark the user as active and return the org', (done) => {
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    orgUserService.markActive.and.returnValue(of(apiEouRes));

    component
      .markUserActive()
      .pipe(
        finalize(() => {
          expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
          expect(router.navigate).toHaveBeenCalledOnceWith([
            '/',
            'enterprise',
            'my_dashboard',
            { openSMSOptInDialog: undefined },
          ]);
        })
      )
      .subscribe((res) => {
        expect(res).toEqual(apiEouRes);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(orgUserService.markActive).toHaveBeenCalledTimes(1);
        done();
      });
  });

  describe('handleInviteLinkFlow():', () => {
    it('should handle the flow if user has entered through invite link and navigate to setup page', (done) => {
      spyOn(component, 'navigateToSetupPage');
      component.handleInviteLinkFlow(roles, true).subscribe((res) => {
        expect(res).toBeNull();
        expect(component.navigateToSetupPage).toHaveBeenCalledOnceWith(roles);
        done();
      });
    });

    it('should mark the user active if password is set', (done) => {
      spyOn(component, 'markUserActive').and.returnValue(of(apiEouRes));

      component.handleInviteLinkFlow(roles).subscribe((res) => {
        expect(res).toEqual(apiEouRes);
        expect(component.markUserActive).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('handlePendingDetails():', () => {
    it('should handle flow if the user comes from invite link', (done) => {
      spyOn(component, 'handleInviteLinkFlow').and.returnValue(of(apiEouRes));

      component.handlePendingDetails(roles, true, true).subscribe((res) => {
        expect(res).toEqual(apiEouRes);
        expect(component.handleInviteLinkFlow).toHaveBeenCalledOnceWith(roles, true);
        done();
      });
    });

    it('should show email verification alert if the user has not come through invite link', (done) => {
      spyOn(component, 'showEmailNotVerifiedAlert').and.resolveTo();

      component.handlePendingDetails(roles, false, true).subscribe((res) => {
        expect(res).toBeNull();
        expect(component.showEmailNotVerifiedAlert).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('navigateBasedOnUserStatus(): ', () => {
    beforeEach(() => {
      userService.getUserPasswordStatus.and.returnValue(
        of({
          is_password_required: false,
          is_password_set: true,
        })
      );
    });

    it('should navigate to dashboard if status is active', fakeAsync(() => {
      const config = {
        isPendingDetails: false,
        roles,
        eou: apiEouRes,
      };
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));
      tick();
      component.navigateBasedOnUserStatus(config).subscribe((res) => {
        expect(res).toBeNull();
        expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'my_dashboard',
          { openSMSOptInDialog: undefined },
        ]);
        expect(spenderOnboardingService.checkForRedirectionToOnboarding).toHaveBeenCalledTimes(1);
      });
    }));

    it('should navigate to spender onboarding if status not COMPLETE', (done) => {
      const config = {
        isPendingDetails: false,
        roles,
        eou: apiEouRes,
      };
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(true));
      component.navigateBasedOnUserStatus(config).subscribe((res) => {
        expect(res).toBeNull();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'spender_onboarding']);
        done();
      });
    });

    it('should navigate to disabled page if org is disabled', (done) => {
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

    it('should navigate to dashboard when no enrollment settings are enabled', (done) => {
      const config = {
        isPendingDetails: false,
        roles,
        eou: apiEouRes,
      };
      orgSettingsService.get.and.returnValue(of(orgSettingsCardsDisabled));
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));
      component.navigateBasedOnUserStatus(config).subscribe((res) => {
        expect(res).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith([
          '/',
          'enterprise',
          'my_dashboard',
          { openSMSOptInDialog: undefined },
        ]);
        done();
      });
    });

    it('should handle flow if details are pending', (done) => {
      userService.getUserPasswordStatus.and.returnValue(
        of({
          is_password_required: true,
          is_password_set: false,
        })
      );
      spyOn(component, 'handlePendingDetails').and.returnValue(of(apiEouRes));
      const config = {
        isPendingDetails: true,
        roles,
        eou: apiEouRes,
        isFromInviteLink: true,
        isPasswordSetRequired: true,
      };

      component.navigateBasedOnUserStatus(config).subscribe((res) => {
        expect(res).toEqual(apiEouRes);
        expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
        expect(component.handlePendingDetails).toHaveBeenCalledOnceWith(
          config.roles,
          config.isFromInviteLink,
          config.isPasswordSetRequired
        );
        done();
      });
    });
  });

  it('proceed(): should proceed to other page as per user status', fakeAsync(() => {
    userService.isPendingDetails.and.returnValue(of(true));
    authService.getEou.and.resolveTo(apiEouRes);
    authService.getRoles.and.returnValue(of(roles));
    orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
    orgUserService.getCurrent.and.returnValue(of(apiEouRes));
    spyOn(component, 'setSentryUser').and.callThrough();
    spyOn(component, 'navigateBasedOnUserStatus').and.returnValue(of(apiEouRes));
    loaderService.hideLoader.and.returnValue(new Promise(() => {}));
    deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
    appVersionService.load.and.callThrough();
    appVersionService.getUserAppVersionDetails.and.returnValue(
      of({
        deviceInfo: extendedDeviceInfoMockData,
        appSupportDetails: {
          message: 'message',
          supported: true,
        },
        lastLoggedInVersion: '5.50.0',
        eou: apiEouRes,
      })
    );

    component.proceed();
    tick(1000);
    expect(userService.isPendingDetails).toHaveBeenCalledTimes(1);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(authService.getRoles).toHaveBeenCalledTimes(1);
    expect(component.setSentryUser).toHaveBeenCalledOnceWith(apiEouRes);
    expect(component.navigateBasedOnUserStatus).toHaveBeenCalledOnceWith({
      isPendingDetails: true,
      roles,
      eou: apiEouRes,
      isFromInviteLink: undefined,
    });
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(2);
    expect(appVersionService.load).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData);
    expect(appVersionService.getUserAppVersionDetails).toHaveBeenCalledOnceWith(extendedDeviceInfoMockData);
    expect(trackingService.eventTrack).toHaveBeenCalledOnceWith('Auto Logged out', {
      lastLoggedInVersion: '5.50.0',
      appVersion: extendedDeviceInfoMockData.appVersion,
    });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'app_version', { message: 'message' }]);
  }));

  it('trackSwitchOrg(): tracking switch orgs', fakeAsync(() => {
    authService.getEou.and.resolveTo(apiEouRes);

    component.trackSwitchOrg(orgData1[0], apiEouRes);
    tick(500);
    const properties = {
      Asset: 'Mobile',
      'Switch To': orgData1[0].id,
      'Is Destination Org Active': true,
      'Is Destination Org Primary': true,
      'Is Current Org Primary': true,
      Source: 'User Clicked',
      'User Org ID': 'orNVthTo2Zyo',
    };
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(trackingService.onSwitchOrg).toHaveBeenCalledOnceWith(properties);
  }));

  describe('switchOrg(): ', () => {
    it('should catch error and clear all caches', fakeAsync(() => {
      authService.getEou.and.resolveTo(apiEouRes);
      loaderService.showLoader.and.resolveTo();
      orgService.switchOrg.and.returnValue(throwError(() => {}));
      secureStorageService.clearAll.and.resolveTo({ value: true });
      storageService.clearAll.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      userEventService.logout.and.returnValue(null);
      spyOn(globalCacheBusterNotifier, 'next');

      component.switchOrg(orgData1[0]);

      tick(1000);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait...', 2000);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(orgService.switchOrg).toHaveBeenCalledOnceWith(orgData1[0].id);
      expect(secureStorageService.clearAll).toHaveBeenCalledTimes(1);
      expect(storageService.clearAll).toHaveBeenCalledTimes(1);
      expect(globalCacheBusterNotifier.next).toHaveBeenCalledTimes(1);

      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(userEventService.logout).toHaveBeenCalledTimes(1);
    }));

    it('should switch org', fakeAsync(() => {
      authService.getEou.and.resolveTo(apiEouRes);
      loaderService.showLoader.and.resolveTo();
      orgService.switchOrg.and.returnValue(of(apiEouRes));
      spyOn(component, 'trackSwitchOrg').and.returnValue(null);
      spyOn(component, 'proceed').and.resolveTo(null);
      spyOn(globalCacheBusterNotifier, 'next');

      component.switchOrg(orgData1[0]);
      tick(1000);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait...', 2000);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(recentLocalStorageItemsService.clearRecentLocalStorageCache).toHaveBeenCalledTimes(1);
      expect(component.proceed).toHaveBeenCalledTimes(1);
      expect(userEventService.clearTaskCache).toHaveBeenCalledTimes(1);
      expect(globalCacheBusterNotifier.next).toHaveBeenCalledTimes(1);
      expect(component.trackSwitchOrg).toHaveBeenCalledOnceWith(orgData1[0], apiEouRes);
      expect(orgService.switchOrg).toHaveBeenCalledOnceWith(orgData1[0].id);
    }));
  });

  describe('signOut(): ', () => {
    it('should sign out the user', fakeAsync(() => {
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
      authService.getEou.and.resolveTo(apiEouRes);
      authService.logout.and.returnValue(of(null));
      spyOn(globalCacheBusterNotifier, 'next');

      component.signOut();
      tick(1000);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(1);
      expect(authService.logout).toHaveBeenCalledOnceWith({
        device_id: extendedDeviceInfoMockData.identifier,
        user_id: apiEouRes.us.id,
      });

      expect(secureStorageService.clearAll).toHaveBeenCalledTimes(1);
      expect(storageService.clearAll).toHaveBeenCalledTimes(1);
      expect(userEventService.logout).toHaveBeenCalledTimes(1);
      expect(globalCacheBusterNotifier.next).toHaveBeenCalledTimes(1);
    }));

    it('should clear cache if sign out fails', fakeAsync(() => {
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
      authService.getEou.and.throwError('Error');
      spyOn(globalCacheBusterNotifier, 'next');

      component.signOut();
      tick(1000);
      expect(secureStorageService.clearAll).toHaveBeenCalledTimes(1);
      expect(storageService.clearAll).toHaveBeenCalledTimes(1);
      expect(globalCacheBusterNotifier.next).toHaveBeenCalledTimes(1);
    }));
  });

  describe('getOrgsWhichContainSearchText(): ', () => {
    it('should return orgs with matching search text', () => {
      const result = component.getOrgsWhichContainSearchText(orgData2, 'Fyle Loaded');
      expect(result).toEqual([orgData2[1]]);
    });

    it('should return orgs sorted by name', () => {
      const result = component.getOrgsWhichContainSearchText(orgData2, 'Loaded');
      expect(result).toEqual([orgData2[1], orgData2[0]]);
    });
  });

  it('resetSearch(): should reset search bar', () => {
    component.searchInput = 'value';
    component.searchOrgsInput.nativeElement.value = 'value2';
    fixture.detectChanges();

    component.resetSearch();
    expect(component.searchInput).toEqual('');
  });

  it('openSearchBar(): should open search bar', () => {
    component.openSearchBar();

    const contentClassList = component.contentRef.nativeElement.classList;
    const searchBarClassList = component.searchRef.nativeElement.classList;

    expect(contentClassList.contains('switch-org__content-container__content-block--hide')).toBeTrue();
    expect(searchBarClassList.contains('switch-org__content-container__search-block--show')).toBeTrue();
  });

  it('cancelSearch(): should cancel the search and remove the bar', () => {
    spyOn(component, 'resetSearch');

    const contentClassList = component.contentRef.nativeElement.classList;
    const searchBarClassList = component.searchRef.nativeElement.classList;

    component.cancelSearch();
    expect(component.resetSearch).toHaveBeenCalledTimes(1);
    expect(contentClassList.contains('switch-org__content-container__content-block--hide')).toBeFalse();
    expect(searchBarClassList.contains('switch-org__content-container__search-block--show')).toBeFalse();
  });

  it('should cancel search when clicking on CANCEL button', () => {
    spyOn(component, 'cancelSearch');

    const cancelButton = getElementBySelector(fixture, '.switch-org__searchbar-container__cancel') as HTMLElement;
    click(cancelButton);

    expect(component.cancelSearch).toHaveBeenCalledTimes(1);
  });

  it('should reset search when clicking on RESET button', () => {
    spyOn(component, 'resetSearch');
    component.searchInput = 'Staging Loaded';
    fixture.detectChanges();

    const resetButton = getElementBySelector(
      fixture,
      '.switch-org__searchbar-container__searchbar__clear-icon'
    ) as HTMLElement;
    click(resetButton);

    expect(component.resetSearch).toHaveBeenCalledTimes(1);
  });

  it('should open search bar on clicking on the OPEN icon', () => {
    spyOn(component, 'openSearchBar');

    const openButton = getElementBySelector(fixture, '.switch-org__content-container__content__icon') as HTMLElement;
    click(openButton);

    expect(component.openSearchBar).toHaveBeenCalledTimes(1);
  });

  it('should show orgs as cards', () => {
    component.filteredOrgs$ = of(orgData2);
    component.primaryOrg$ = of(orgData1[0]);
    component.isLoading = false;
    fixture.detectChanges();
    const orgCards = getAllElementsBySelector(fixture, "[data-test='org-cards']");

    expect(orgCards.length).toEqual(orgData2.length);
  });

  describe('redirectToDashboard(): ', () => {
    beforeEach(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      orgService.switchOrg.and.returnValue(of(apiEouRes));
      userEventService.clearTaskCache.and.returnValue();
      recentLocalStorageItemsService.clearRecentLocalStorageCache.and.returnValue();
      authService.getEou.and.resolveTo(apiEouRes);
      spyOn(component, 'setSentryUser').and.returnValue();
      spyOn(component, 'navigateToDashboard').and.returnValue();
      spyOn(globalCacheBusterNotifier, 'next').and.returnValue();
    });

    it('should redirect to dashboard successfully', fakeAsync(() => {
      const orgId = 'orNVthTo2Zyo';
      component.redirectToDashboard(orgId);

      tick(200);

      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait...', 2000);
      expect(orgService.switchOrg).toHaveBeenCalledOnceWith(orgId);
      expect(globalCacheBusterNotifier.next).toHaveBeenCalledOnceWith();
      expect(userEventService.clearTaskCache).toHaveBeenCalledOnceWith();
      expect(recentLocalStorageItemsService.clearRecentLocalStorageCache).toHaveBeenCalledOnceWith();
      expect(authService.getEou).toHaveBeenCalledOnceWith();
      expect(component.setSentryUser).toHaveBeenCalledOnceWith(apiEouRes);
      expect(loaderService.hideLoader).toHaveBeenCalledOnceWith();
      expect(component.navigateToDashboard).toHaveBeenCalledOnceWith(true);
    }));

    it('should navigate to switch org page on error', fakeAsync(() => {
      const orgId = 'orNVthTo2Zyo';
      orgService.switchOrg.and.returnValue(throwError(() => new Error('Switch org failed')));

      component.redirectToDashboard(orgId);
      tick(200);

      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait...', 2000);
      expect(orgService.switchOrg).toHaveBeenCalledOnceWith(orgId);
      expect(loaderService.hideLoader).toHaveBeenCalledOnceWith();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org']);
      expect(component.navigateToDashboard).not.toHaveBeenCalled();
    }));

    it('should handle error during getEou and navigate to switch org page', fakeAsync(() => {
      const orgId = 'orNVthTo2Zyo';
      authService.getEou.and.rejectWith(new Error('Get EOU failed'));

      component.redirectToDashboard(orgId);
      tick(200);

      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait...', 2000);
      expect(orgService.switchOrg).toHaveBeenCalledOnceWith(orgId);
      expect(globalCacheBusterNotifier.next).toHaveBeenCalledOnceWith();
      expect(userEventService.clearTaskCache).toHaveBeenCalledOnceWith();
      expect(recentLocalStorageItemsService.clearRecentLocalStorageCache).toHaveBeenCalledOnceWith();
      expect(authService.getEou).toHaveBeenCalledOnceWith();
      expect(loaderService.hideLoader).toHaveBeenCalledOnceWith();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org']);
      expect(component.navigateToDashboard).not.toHaveBeenCalled();
    }));
  });
});
