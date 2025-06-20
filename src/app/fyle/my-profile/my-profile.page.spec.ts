import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { selectedCurrencies } from 'src/app/core/mock-data/currency.data';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { apiEouRes, eouRes2, eouRes3, eouWithNoAttempts } from 'src/app/core/mock-data/extended-org-user.data';
import { allInfoCardsData } from 'src/app/core/mock-data/info-card-data.data';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { OrgService } from 'src/app/core/services/org.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { PopupWithBulletsComponent } from 'src/app/shared/components/popup-with-bullets/popup-with-bullets.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from '../../core/services/tracking.service';
import { MyProfilePage } from './my-profile.page';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { SpenderService } from 'src/app/core/services/platform/v1/spender/spender.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { FyOptInComponent } from 'src/app/shared/components/fy-opt-in/fy-opt-in.component';
import { UtilityService } from 'src/app/core/services/utility.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';

describe('MyProfilePage', () => {
  let component: MyProfilePage;
  let fixture: ComponentFixture<MyProfilePage>;
  let authService: jasmine.SpyObj<AuthService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
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
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let paymentModeService: jasmine.SpyObj<PaymentModesService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let spenderOnboardingService: jasmine.SpyObj<SpenderOnboardingService>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'logout', 'refreshEou']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['post', 'get']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['logout']);
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['clearAll']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['clearAll']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'onSettingsToggle',
      'showToastMessage',
      'mobileNumberVerified',
      'updateMobileNumber',
      'verifyMobileNumber',
      'optedOut',
      'deleteMobileNumber',
      'optInClickedFromProfile',
      'updateMobileNumberClicked',
      'optedInFromProfile',
    ]);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const paymentModeServiceSpy = jasmine.createSpyObj('PaymentModesService', ['getPaymentModeDisplayName']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['isUserFromINCluster']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'checkForRedirectionToOnboarding',
    ]);

    TestBed.configureTestingModule({
      declarations: [MyProfilePage],
      imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                openPopover: '',
              },
            },
          },
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
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
          provide: DeviceService,
          useValue: deviceServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: OrgService,
          useValue: orgServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
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
          provide: PaymentModesService,
          useValue: paymentModeServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
        {
          provide: SpenderOnboardingService,
          useValue: spenderOnboardingServiceSpy,
        },
        SpenderService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfilePage);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    paymentModeService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService) as jasmine.SpyObj<SpenderOnboardingService>;
    component.eou$ = of(apiEouRes);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setupNetworkWatcher(): should setup network watcher', () => {
    networkService.isOnline.and.returnValue(of(true));

    component.setupNetworkWatcher();

    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    expect(networkService.connectivityWatcher).toHaveBeenCalledOnceWith(new EventEmitter<boolean>());
  });

  describe('signOut():', () => {
    it('should sign out the user and clear all cache', fakeAsync(() => {
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
      authService.getEou.and.resolveTo(apiEouRes);
      authService.logout.and.returnValue(of(null));

      component.signOut();
      tick(500);

      expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(secureStorageService.clearAll).toHaveBeenCalledTimes(1);
      expect(storageService.clearAll).toHaveBeenCalledTimes(1);
      expect(userEventService.logout).toHaveBeenCalledTimes(1);
    }));

    it('should throw an error but clear cache if logout fails', fakeAsync(() => {
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
      authService.getEou.and.resolveTo(apiEouRes);
      authService.logout.and.returnValue(throwError(() => new Error('error')));

      try {
        component.signOut();
        tick(500);
      } catch (err) {
        expect(err).toBeTruthy();
      }
    }));
  });

  describe('showToastMessage(): ', () => {
    it('should show success snackbar with message', () => {
      const message = 'Profile saved successfully';
      const successToastProperties = {
        data: {
          icon: 'check-square-fill',
          showCloseButton: true,
          message,
        },
        duration: 3000,
      };

      snackbarProperties.setSnackbarProperties.and.returnValue(successToastProperties);
      component.showToastMessage(message, 'success');

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...successToastProperties,
        panelClass: 'msb-success',
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', { message }, undefined);
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });

    it('should show error snackbar with message', () => {
      const message = 'Something went wrong';
      const failureToastProperties = {
        data: {
          icon: 'warning-fill',
          showCloseButton: true,
          message,
        },
        duration: 3000,
      };

      snackbarProperties.setSnackbarProperties.and.returnValue(failureToastProperties);
      component.showToastMessage(message, 'failure');

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...failureToastProperties,
        panelClass: 'msb-failure',
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('failure', { message }, undefined);
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });

    it('should show content copied snackbar with message', () => {
      const message = 'Mobile number copied successfully';
      const successToastProperties = {
        data: {
          icon: 'success',
          showCloseButton: true,
          message,
        },
        duration: 3000,
      };

      snackbarProperties.setSnackbarProperties.and.returnValue(successToastProperties);
      component.showToastMessage(message, 'success');

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...successToastProperties,
        panelClass: 'msb-success',
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith(
        'success',
        { message },
        'check-circle-outline'
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });
  });

  describe('ionViewWillEnter():', () => {
    it('should setup class observables', fakeAsync(() => {
      spyOn(component, 'setupNetworkWatcher');
      authService.getEou.and.resolveTo(apiEouRes);
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));
      tokenService.getClusterDomain.and.resolveTo('domain');
      spyOn(component, 'reset');
      utilityService.isUserFromINCluster.and.resolveTo(false);
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(500);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.reset).toHaveBeenCalledTimes(1);
    }));
  });

  it('reset(): should reset all settings', fakeAsync(() => {
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
    orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    spyOn(component, 'setInfoCardsData');
    spyOn(component, 'setPreferenceSettings');
    spyOn(component, 'setCCCFlags');
    paymentModeService.getPaymentModeDisplayName.and.returnValue('Personal Cash/Card');
    utilityService.isUserFromINCluster.and.resolveTo(false);
    fixture.detectChanges();

    component.reset();
    tick(500);

    expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
    expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
    expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    expect(component.setInfoCardsData).toHaveBeenCalledTimes(1);
    expect(component.setPreferenceSettings).toHaveBeenCalledTimes(1);
    expect(component.setCCCFlags).toHaveBeenCalledTimes(1);
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);

    expect(component.employeeSettings).toEqual(employeeSettingsData);
    expect(component.orgSettings).toEqual(orgSettingsData);
    expect(paymentModeService.getPaymentModeDisplayName).toHaveBeenCalledOnceWith(
      orgSettingsData.payment_mode_settings.payment_modes_order[0]
    );
    expect(component.defaultPaymentMode).toEqual('Personal Cash/Card');
  }));

  it('setCCCFlags(): should set ccc flags as per the org and org user settings', () => {
    component.orgSettings = orgSettingsData;

    component.setCCCFlags();

    expect(component.isCCCEnabled).toBeTrue();
    expect(component.isVisaRTFEnabled).toBeTrue();
    expect(component.isMastercardRTFEnabled).toBeTrue();
  });

  it('setPreferenceSettings(): should set preference settings', () => {
    component.orgSettings = orgSettingsData;
    component.employeeSettings = employeeSettingsData;
    fixture.detectChanges();

    component.setPreferenceSettings();

    expect(component.preferenceSettings.length).toEqual(2);
  });

  it('setInfoCardsData(): should show only email card for non USD orgs', () => {
    component.setInfoCardsData();
    expect(component.infoCardsData).toEqual(allInfoCardsData);
  });

  describe('toggleSetting():', () => {
    it('should toggle settings to true', () => {
      const mockEmployeeSettings = cloneDeep(employeeSettingsData);
      component.employeeSettings = mockEmployeeSettings;
      platformEmployeeSettingsService.post.and.returnValue(of(null));

      component.toggleSetting({
        key: 'instaFyle',
        isEnabled: true,
      });

      expect(trackingService.onSettingsToggle).toHaveBeenCalledOnceWith({
        userSetting: 'instaFyle',
        action: 'enabled',
      });
      expect(platformEmployeeSettingsService.post).toHaveBeenCalledOnceWith(mockEmployeeSettings);
    });

    it('should toggle settings to false for default currency', () => {
      const mockEmployeeSettings = cloneDeep(employeeSettingsData);
      component.employeeSettings = mockEmployeeSettings;
      platformEmployeeSettingsService.post.and.returnValue(of(null));

      component.toggleSetting({
        key: 'instaFyle',
        isEnabled: false,
      });

      expect(trackingService.onSettingsToggle).toHaveBeenCalledOnceWith({
        userSetting: 'instaFyle',
        action: 'disabled',
      });
      expect(platformEmployeeSettingsService.post).toHaveBeenCalledOnceWith(mockEmployeeSettings);
    });
  });

  it('showSuccessPopover(): should show success popover', fakeAsync(() => {
    const popoverSpy = jasmine.createSpyObj('verificationSuccessfulPopover', ['present', 'onWillDismiss']);
    popoverSpy.onWillDismiss.and.resolveTo();
    popoverController.create.and.resolveTo(popoverSpy);

    component.showSuccessPopover();
    tick(200);

    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: PopupWithBulletsComponent,
      componentProps: {
        title: 'Verification successful',
        listHeader: 'Now you can:',
        listItems: [
          {
            icon: 'envelope',
            text: 'Message your receipts to Fyle at (302) 440-2921 and we will create an expense for you.',
            textToCopy: '(302) 440-2921',
          },
          {
            icon: 'cash',
            text: 'Standard messaging rates applicable',
          },
        ],
        ctaText: 'Got it',
      },
      cssClass: 'pop-up-in-center',
    });

    expect(popoverSpy.present).toHaveBeenCalledOnceWith();
    expect(popoverSpy.onWillDismiss).toHaveBeenCalledOnceWith();
  }));

  describe('optInMobileNumber(): ', () => {
    beforeEach(() => {
      authService.refreshEou.and.returnValue(of(apiEouRes));
      authService.getEou.and.resolveTo(apiEouRes);
      spyOn(component, 'showToastMessage');
    });

    it('should open edit number popover and show success toast message if update is successful', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('updateMobileNumberPopover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });
      modalController.create.and.resolveTo(popoverSpy);

      component.optInMobileNumber(apiEouRes);
      tick(500);
      fixture.detectChanges();

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyOptInComponent,
        componentProps: {
          extendedOrgUser: apiEouRes,
        },
        mode: 'ios',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(trackingService.optedInFromProfile).toHaveBeenCalledTimes(1);
    }));

    it('should should show success toast message if there are no more attempts left', fakeAsync(() => {
      component.eou$ = of(eouWithNoAttempts);
      const popoverSpy = jasmine.createSpyObj('updateMobileNumberPopover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });
      modalController.create.and.resolveTo(popoverSpy);
      fixture.detectChanges();

      component.optInMobileNumber(eouWithNoAttempts);
      tick(500);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyOptInComponent,
        componentProps: {
          extendedOrgUser: eouWithNoAttempts,
        },
        mode: 'ios',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(trackingService.optedInFromProfile).toHaveBeenCalledTimes(1);
    }));

    it('should open add number popover and show error toast message if api returns error', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('updateMobileNumberPopover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'ERROR' } });
      modalController.create.and.resolveTo(popoverSpy);

      const eouWithoutMobileNumber = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          mobile: null,
        },
      };

      component.optInMobileNumber(eouWithoutMobileNumber);
      tick(500);
      fixture.detectChanges();

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyOptInComponent,
        componentProps: {
          extendedOrgUser: eouWithoutMobileNumber,
        },
        mode: 'ios',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);

      expect(component.showToastMessage).toHaveBeenCalledOnceWith(
        'Something went wrong. Please try again later.',
        'failure'
      );
      expect(authService.getEou).toHaveBeenCalledTimes(1);
    }));
  });

  describe('optOutClick():', () => {
    it('should open a popover and call optOut if user confirms', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('optOutPopover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'continue' } });
      popoverController.create.and.resolveTo(popoverSpy);

      spyOn(component, 'optOut');

      component.optOutClick();
      tick(100);

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);

      expect(component.optOut).toHaveBeenCalledTimes(1);
    }));

    it('should not call optOut if user cancels', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('optOutPopover', ['present', 'onWillDismiss', 'dismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'cancel' } });
      popoverController.create.and.resolveTo(popoverSpy);

      spyOn(component, 'optOut');

      component.optOutClick();
      tick(100);

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);

      expect(component.optOut).not.toHaveBeenCalled();
    }));
  });

  it('optOut(): should delete mobile number', fakeAsync(() => {
    const mockEou = cloneDeep(eouRes2);
    authService.getEou.and.resolveTo(mockEou);
    authService.refreshEou.and.returnValue(of({ ...mockEou, ou: { ...mockEou.ou, mobile: '' } }));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    orgUserService.postOrgUser.and.returnValue(of(apiEouRes.us));
    spyOn(component, 'showToastMessage');

    component.optOut();
    tick(500);

    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith({ ...mockEou.ou, mobile: '' });
    expect(authService.refreshEou).toHaveBeenCalledTimes(1);
    expect(trackingService.optedOut).toHaveBeenCalledTimes(1);
    expect(component.showToastMessage).toHaveBeenCalledOnceWith('Opted out of text messages successfully', 'success');
    component.eou$.subscribe((eou) => {
      expect(eou.ou.mobile).toBe('');
    });
  }));

  describe('onDeleteCTAClicked():', () => {
    beforeEach(() => {
      spyOn(component, 'deleteMobileNumber');
    });

    it('should delete mobile number if user confirms in the popover modal', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('deleteMobileNumberPopover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'continue' } });
      popoverController.create.and.resolveTo(popoverSpy);

      component.onDeleteCTAClicked();
      tick(100);

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);

      expect(component.deleteMobileNumber).toHaveBeenCalledTimes(1);
    }));

    it('should dismiss the popover if user cancels in the popover modal', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('deleteMobileNumberPopover', ['present', 'onWillDismiss', 'dismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'cancel' } });
      popoverController.create.and.resolveTo(popoverSpy);

      component.onDeleteCTAClicked();
      tick(100);

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);

      expect(component.deleteMobileNumber).not.toHaveBeenCalled();
    }));
  });

  it('deleteMobileNumber(): should delete the mobile number and show toast message', fakeAsync(() => {
    const mockEou = cloneDeep(eouRes2);
    authService.getEou.and.resolveTo(mockEou);
    authService.refreshEou.and.returnValue(of({ ...mockEou, ou: { ...mockEou.ou, mobile: '' } }));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    orgUserService.postOrgUser.and.returnValue(of(apiEouRes.us));
    spyOn(component, 'showToastMessage');

    component.deleteMobileNumber();
    tick(500);

    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith({ ...mockEou.ou, mobile: '' });
    expect(authService.refreshEou).toHaveBeenCalledTimes(1);
    expect(trackingService.deleteMobileNumber).toHaveBeenCalledTimes(1);
    expect(component.showToastMessage).toHaveBeenCalledOnceWith('Mobile number deleted successfully.', 'success');
    component.eou$.subscribe((eou) => {
      expect(eou.ou.mobile).toBe('');
    });
  }));

  it('updateMobileNumber(): should open update mobile number popover', fakeAsync(() => {
    authService.refreshEou.and.returnValue(of(apiEouRes));
    spyOn(component, 'showToastMessage');
    const popoverSpy = jasmine.createSpyObj('updateMobileNumberPopover', ['present', 'onWillDismiss']);
    popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });
    popoverController.create.and.resolveTo(popoverSpy);

    component.updateMobileNumber(apiEouRes);
    tick(100);

    expect(popoverController.create).toHaveBeenCalledTimes(1);
    expect(popoverSpy.present).toHaveBeenCalledTimes(1);
    expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
    expect(authService.refreshEou).toHaveBeenCalledTimes(1);
    expect(component.showToastMessage).toHaveBeenCalledOnceWith('Mobile number updated successfully', 'success');
  }));
});
