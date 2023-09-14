import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { selectedCurrencies } from 'src/app/core/mock-data/currency.data';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { apiEouRes, eouRes3, eouWithNoAttempts } from 'src/app/core/mock-data/extended-org-user.data';
import { allInfoCardsData } from 'src/app/core/mock-data/info-card-data.data';
import { orgUserSettingsData, orgUserSettingsWoInstaFyle } from 'src/app/core/mock-data/org-user-settings.data';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
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
import { UpdateMobileNumberComponent } from './update-mobile-number/update-mobile-number.component';
import { VerifyNumberPopoverComponent } from './verify-number-popover/verify-number-popover.component';
import { orgData1 } from 'src/app/core/mock-data/org.data';

describe('MyProfilePage', () => {
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
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'logout', 'refreshEou']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['post', 'get']);
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
    ]);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);

    TestBed.configureTestingModule({
      declarations: [MyProfilePage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
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
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
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
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfilePage);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;

    component.loadEou$ = new BehaviorSubject(null);
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
          icon: 'tick-square-filled',
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
          icon: 'danger',
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
        'tick-circle-outline-white'
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });
  });

  describe('ionViewWillEnter():', () => {
    it('should setup class observables and show update mobile number modal', fakeAsync(() => {
      spyOn(component, 'setupNetworkWatcher');
      authService.getEou.and.resolveTo(apiEouRes);
      tokenService.getClusterDomain.and.resolveTo('domain');
      spyOn(component, 'reset');
      spyOn(component, 'updateMobileNumber');
      activatedRoute.snapshot.params.openPopover = 'add_mobile_number';
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(500);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.reset).toHaveBeenCalledTimes(1);
      expect(component.updateMobileNumber).toHaveBeenCalledOnceWith(apiEouRes);
    }));

    it('should setup class observables and show verify mobile number modal', fakeAsync(() => {
      spyOn(component, 'setupNetworkWatcher');
      authService.getEou.and.resolveTo(apiEouRes);
      tokenService.getClusterDomain.and.resolveTo('domain');
      spyOn(component, 'reset');
      spyOn(component, 'verifyMobileNumber');
      activatedRoute.snapshot.params.openPopover = 'verify_mobile_number';
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(1000);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.reset).toHaveBeenCalledTimes(1);
      expect(component.verifyMobileNumber).toHaveBeenCalledOnceWith(apiEouRes);
    }));

    it('should not open any modal if open popover is not passed as a param', fakeAsync(() => {
      spyOn(component, 'setupNetworkWatcher');
      authService.getEou.and.resolveTo(apiEouRes);
      tokenService.getClusterDomain.and.resolveTo('domain');
      spyOn(component, 'reset');
      spyOn(component, 'verifyMobileNumber');
      spyOn(component, 'updateMobileNumber');
      activatedRoute.snapshot.params.openPopover = null;
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick(1000);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(authService.getEou).not.toHaveBeenCalled();
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.reset).toHaveBeenCalledTimes(1);
      expect(component.verifyMobileNumber).not.toHaveBeenCalled();
      expect(component.updateMobileNumber).not.toHaveBeenCalled();
    }));
  });

  it('reset(): should reset all settings', fakeAsync(() => {
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    spyOn(component, 'setInfoCardsData');
    spyOn(component, 'setPreferenceSettings');
    spyOn(component, 'setCCCFlags');
    fixture.detectChanges();

    component.reset();
    tick(500);

    expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
    expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
    expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    expect(component.setInfoCardsData).toHaveBeenCalledOnceWith(apiEouRes);
    expect(component.setPreferenceSettings).toHaveBeenCalledTimes(1);
    expect(component.setCCCFlags).toHaveBeenCalledTimes(1);
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);

    expect(component.orgUserSettings).toEqual(orgUserSettingsData);
    expect(component.orgSettings).toEqual(orgSettingsData);
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
    component.orgUserSettings = orgUserSettingsWoInstaFyle;
    fixture.detectChanges();

    component.setPreferenceSettings();

    expect(component.preferenceSettings.length).toEqual(2);
  });

  describe('setInfoCardsData(): ', () => {
    it('should show only email card for non USD orgs', () => {
      component.setInfoCardsData(eouRes3);
      expect(component.infoCardsData).toEqual([allInfoCardsData[1]]);
    });

    it('should show both email and mobile number cards for USD orgs', () => {
      const eou = cloneDeep(apiEouRes);
      eou.ou.mobile_verified = true;
      component.setInfoCardsData(eou);
      expect(component.infoCardsData).toEqual(allInfoCardsData);
    });
  });

  describe('toggleSetting():', () => {
    it('should toggle settings to true', () => {
      component.orgUserSettings = orgUserSettingsData;
      orgUserSettingsService.post.and.returnValue(of(null));

      component.toggleSetting({
        key: 'defaultCurrency',
        isEnabled: true,
        selectedCurrency: selectedCurrencies[0],
      });

      expect(trackingService.onSettingsToggle).toHaveBeenCalledOnceWith({
        userSetting: 'defaultCurrency',
        action: 'enabled',
        setDefaultCurrency: true,
      });
      expect(orgUserSettingsService.post).toHaveBeenCalledOnceWith(orgUserSettingsData);
    });

    it('should toggle settings to false for default currency', () => {
      component.orgUserSettings = orgUserSettingsData;
      orgUserSettingsService.post.and.returnValue(of(null));

      component.toggleSetting({
        key: 'defaultCurrency',
        isEnabled: false,
        selectedCurrency: null,
      });

      expect(trackingService.onSettingsToggle).toHaveBeenCalledOnceWith({
        userSetting: 'defaultCurrency',
        action: 'disabled',
        setDefaultCurrency: false,
      });
      expect(orgUserSettingsService.post).toHaveBeenCalledOnceWith(orgUserSettingsData);
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
        title: 'Verification Successful',
        listHeader: 'Now you can:',
        listItems: [
          {
            icon: 'message',
            text: 'Message your receipts to Fyle at (302) 440-2921 and we will create an expense for you.',
            textToCopy: '(302) 440-2921',
          },
          {
            icon: 'fy-reimbursable',
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

  describe('verifyMobileNumber():', () => {
    it('should open update mobile number modal if user selects BACK', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('verifyNumberPopoverComponent', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'BACK',
        },
      });

      popoverController.create.and.resolveTo(popoverSpy);
      spyOn(component, 'updateMobileNumber');
      authService.refreshEou.and.returnValue(of(apiEouRes));
      spyOn(component.loadEou$, 'next');

      component.verifyMobileNumber(apiEouRes);
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: VerifyNumberPopoverComponent,
        componentProps: {
          extendedOrgUser: apiEouRes,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(component.updateMobileNumber).toHaveBeenCalledOnceWith(apiEouRes);
      expect(component.loadEou$.next).toHaveBeenCalledOnceWith(null);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(trackingService.verifyMobileNumber).toHaveBeenCalledTimes(1);
    }));

    it('should show success popover if action is successful and home currency is USD', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('verifyNumberPopoverComponent', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'SUCCESS',
          homeCurrency: 'USD',
        },
      });
      authService.refreshEou.and.returnValue(of(apiEouRes));
      spyOn(component.loadEou$, 'next');

      popoverController.create.and.resolveTo(popoverSpy);
      spyOn(component, 'showSuccessPopover');

      component.verifyMobileNumber(apiEouRes);
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: VerifyNumberPopoverComponent,
        componentProps: {
          extendedOrgUser: apiEouRes,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(component.showSuccessPopover).toHaveBeenCalledTimes(1);
      expect(component.loadEou$.next).toHaveBeenCalledOnceWith(null);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(trackingService.verifyMobileNumber).toHaveBeenCalledTimes(1);
    }));

    it('should show toast is home currency is not USD', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('verifyNumberPopoverComponent', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'SUCCESS',
          homeCurrency: 'INR',
        },
      });
      authService.refreshEou.and.returnValue(of(apiEouRes));
      spyOn(component.loadEou$, 'next');

      popoverController.create.and.resolveTo(popoverSpy);
      spyOn(component, 'showToastMessage');

      component.verifyMobileNumber(apiEouRes);
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: VerifyNumberPopoverComponent,
        componentProps: {
          extendedOrgUser: apiEouRes,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(component.showToastMessage).toHaveBeenCalledOnceWith('Mobile Number Verified Successfully', 'success');
      expect(component.loadEou$.next).toHaveBeenCalledOnceWith(null);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(trackingService.verifyMobileNumber).toHaveBeenCalledTimes(1);
    }));
  });

  describe('onVerifyCtaClicked():', () => {
    it('should open verify mobile number modal if there are attempts left', () => {
      spyOn(component, 'verifyMobileNumber');

      component.onVerifyCtaClicked(apiEouRes);

      expect(component.verifyMobileNumber).toHaveBeenCalledOnceWith(apiEouRes);
    });

    it('should show toast message if there are no attempt left', () => {
      spyOn(component, 'showToastMessage');

      component.onVerifyCtaClicked(eouWithNoAttempts);

      expect(component.showToastMessage).toHaveBeenCalledOnceWith(
        'You have reached the limit to request OTP. Retry after 24 hours.',
        'failure'
      );
    });
  });

  describe('updateMobileNumber(): ', () => {
    beforeEach(() => {
      authService.refreshEou.and.returnValue(of(apiEouRes));
      spyOn(component, 'showToastMessage');
      spyOn(component, 'verifyMobileNumber').and.resolveTo();
      spyOn(component.loadEou$, 'next');
    });

    it('should open edit number popover and show success toast message if update is successful', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('updateMobileNumberPopover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });
      popoverController.create.and.resolveTo(popoverSpy);

      component.updateMobileNumber(apiEouRes);
      tick(500);
      fixture.detectChanges();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: UpdateMobileNumberComponent,
        componentProps: {
          title: 'Edit Mobile Number',
          ctaText: 'Next',
          inputLabel: 'Mobile Number',
          extendedOrgUser: apiEouRes,
          placeholder: 'Enter mobile number e.g. +129586736556',
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(component.loadEou$.next).toHaveBeenCalledOnceWith(null);
      expect(component.verifyMobileNumber).toHaveBeenCalledOnceWith(apiEouRes);
      expect(component.showToastMessage).not.toHaveBeenCalled();
    }));

    it('should should show success toast message if there are no more attempts left', fakeAsync(() => {
      component.eou$ = of(eouWithNoAttempts);
      const popoverSpy = jasmine.createSpyObj('updateMobileNumberPopover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });
      popoverController.create.and.resolveTo(popoverSpy);
      fixture.detectChanges();

      component.updateMobileNumber(eouWithNoAttempts);
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: UpdateMobileNumberComponent,
        componentProps: {
          title: 'Edit Mobile Number',
          ctaText: 'Save',
          inputLabel: 'Mobile Number',
          extendedOrgUser: eouWithNoAttempts,
          placeholder: 'Enter mobile number e.g. +129586736556',
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(component.loadEou$.next).toHaveBeenCalledOnceWith(null);
      expect(component.showToastMessage).toHaveBeenCalledOnceWith('Mobile Number Updated Successfully', 'success');
    }));

    it('should open add number popover and show error toast message if api returns error', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('updateMobileNumberPopover', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'ERROR' } });
      popoverController.create.and.resolveTo(popoverSpy);

      const eouWithoutMobileNumber = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          mobile: null,
        },
      };

      component.updateMobileNumber(eouWithoutMobileNumber);
      tick(500);
      fixture.detectChanges();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: UpdateMobileNumberComponent,
        componentProps: {
          title: 'Add Mobile Number',
          ctaText: 'Next',
          inputLabel: 'Mobile Number',
          extendedOrgUser: eouWithoutMobileNumber,
          placeholder: 'Enter mobile number e.g. +129586736556',
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);

      expect(component.showToastMessage).toHaveBeenCalledOnceWith(
        'Something went wrong. Please try again later.',
        'failure'
      );
    }));
  });
});
