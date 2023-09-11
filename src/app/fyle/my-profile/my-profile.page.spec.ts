import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, of } from 'rxjs';
import { apiEouRes, eouRes3, eouWithNoAttempts } from 'src/app/core/mock-data/extended-org-user.data';
import { allInfoCardsData } from 'src/app/core/mock-data/info-card-data.data';
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
import { PopupWithBulletsComponent } from 'src/app/shared/components/popup-with-bullets/popup-with-bullets.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TrackingService } from '../../core/services/tracking.service';
import { MyProfilePage } from './my-profile.page';
import { UpdateMobileNumberComponent } from './update-mobile-number/update-mobile-number.component';
import { VerifyNumberPopoverComponent } from './verify-number-popover/verify-number-popover.component';

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

    component.loadEou$ = new BehaviorSubject(null);
    component.eou$ = of(apiEouRes);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
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
        'tick-circle-outline',
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });
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
        'failure',
      );
    }));
  });
});
