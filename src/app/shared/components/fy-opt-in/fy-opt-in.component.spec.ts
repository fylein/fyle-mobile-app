import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ModalController } from '@ionic/angular/standalone';

import { FyOptInComponent } from './fy-opt-in.component';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderService } from 'src/app/core/services/loader.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { cloneDeep } from 'lodash';
import { eouRes2 } from 'src/app/core/mock-data/extended-org-user.data';
import { OptInFlowState } from 'src/app/core/enums/opt-in-flow-state.enum';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { Subscription, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { snackbarPropertiesRes2 } from 'src/app/core/mock-data/snackbar-properties.data';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { UserEventService } from 'src/app/core/services/user-event.service';

describe('FyOptInComponent', () => {
  let component: FyOptInComponent;
  let fixture: ComponentFixture<FyOptInComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let mobileNumberVerificationService: jasmine.SpyObj<MobileNumberVerificationService>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let matSnackbar: jasmine.SpyObj<MatSnackBar>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let browserHandlerService: jasmine.SpyObj<BrowserHandlerService>;
  let platformHandlerService: jasmine.SpyObj<PlatformHandlerService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshEou']);
    const mobileNumberVerificationServiceSpy = jasmine.createSpyObj('MobileNumberVerificationService', [
      'sendOtp',
      'verifyOtp',
    ]);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'openOptInDialog',
      'optInFlowRetry',
      'optInFlowSuccess',
      'skipOptInFlow',
      'updateMobileNumber',
      'optInFlowError',
      'showToastMessage',
      'clickedOnHelpArticle',
    ]);
    const matSnackbarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const browserHandlerServiceSpy = jasmine.createSpyObj('BrowserHandlerService', ['openLinkWithToolbarColor']);
    const platformHandlerServiceSpy = jasmine.createSpyObj('PlatformHandlerService', ['registerBackButtonAction']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['clearTaskCache']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, FyOptInComponent],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MobileNumberVerificationService, useValue: mobileNumberVerificationServiceSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: MatSnackBar, useValue: matSnackbarSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: BrowserHandlerService, useValue: browserHandlerServiceSpy },
        { provide: PlatformHandlerService, useValue: platformHandlerServiceSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyOptInComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mobileNumberVerificationService = TestBed.inject(
      MobileNumberVerificationService,
    ) as jasmine.SpyObj<MobileNumberVerificationService>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    matSnackbar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    browserHandlerService = TestBed.inject(BrowserHandlerService) as jasmine.SpyObj<BrowserHandlerService>;
    platformHandlerService = TestBed.inject(PlatformHandlerService) as jasmine.SpyObj<PlatformHandlerService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyOptIn.enterMobileNumber': 'Please enter mobile number',
        'fyOptIn.invalidMobileNumber': 'Please enter a valid number with +1 country code. Try re-entering your number.',
        'fyOptIn.codeSent': 'Code sent successfully',
        'fyOptIn.otpLimitReached': 'You have reached the limit for 6 digit code requests. Try again after 24 hours.',
        'fyOptIn.invalidMobileTryAgain': 'Invalid mobile number. Please try again.',
        'fyOptIn.codeExpired': 'The code has expired. Please request a new one.',
        'fyOptIn.invalidCode': 'Code is invalid',
        'fyOptIn.verifyingCode': 'Verifying code...',
        'fyOptIn.tryAI': 'Try AI',
        'fyOptIn.optInDescription': 'Opt into text messaging for instant expense submission',
        'fyOptIn.mobileNumberLabel': 'Mobile number',
        'fyOptIn.mobileNumberPlaceholder': 'Enter mobile number with country code e.g +155512345..',
        'fyOptIn.otpDescription': 'Enter 6 digit code sent to your phone',
        'fyOptIn.resendCodeIn': 'Resend code in',
        'fyOptIn.attemptsLeft': 'attempts left',
        'fyOptIn.resendCode': 'Resend code',
        'fyOptIn.sendingCode': 'Sending Code',
        'fyOptIn.successHeader': 'You are all set',
        'fyOptIn.successDescription':
          'We have sent you a confirmation message. You can now use text messages to create and submit your next expense!',
        'fyOptIn.sendCodeBtn': 'Send code',
        'fyOptIn.sendCodeLoading': 'Send Code',
        'fyOptIn.readHelpArticle': 'Read help article',
        'fyOptIn.gotIt': 'Got it',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit():', () => {
    beforeEach(() => {
      component.extendedOrgUser = cloneDeep(eouRes2);
    });

    it('should set mobileNumberInputValue if mobile number is present in DB', () => {
      fixture.detectChanges();
      expect(component.mobileNumberInputValue).toBe('123456');
    });

    it('should not set mobileNumberInputValue if mobile number is not present in DB', () => {
      component.extendedOrgUser.ou.mobile = null;
      fixture.detectChanges();
      expect(component.mobileNumberInputValue).toBe('');
    });
  });

  it('get OptInFlowState(): should return OptInFlowState', () => {
    expect(component.OptInFlowState).toEqual(OptInFlowState);
  });

  it('onFocus(): should reset mobile error', () => {
    component.mobileNumberError = 'Invalid mobile number';
    component.onFocus();
    expect(component.mobileNumberError).toBeNull();
  });

  describe('ionViewWillEnter(): ', () => {
    beforeEach(() => {
      component.extendedOrgUser = cloneDeep(eouRes2);
    });

    it('should call track openOptInDialog event', () => {
      component.ionViewWillEnter();
      expect(trackingService.openOptInDialog).toHaveBeenCalledOnceWith({
        isMobileNumberPresent: true,
        isUserVerified: false,
      });
    });

    it('should set hardwareBackButtonAction', () => {
      const mockSubscription = new Subscription();
      platformHandlerService.registerBackButtonAction.and.returnValue(mockSubscription);
      spyOn(component, 'goBack');
      component.ionViewWillEnter();
      expect(component.hardwareBackButtonAction).toEqual(mockSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.goBack,
      );
    });
  });

  describe('goBack():', () => {
    it('should open edit mobile screen if user clicked from otp verification screen', () => {
      component.optInFlowState = OptInFlowState.OTP_VERIFICATION;
      component.goBack();
      expect(component.optInFlowState).toEqual(OptInFlowState.MOBILE_INPUT);
      expect(trackingService.optInFlowRetry).toHaveBeenCalledOnceWith({
        message: 'EDIT_NUMBER',
      });
    });

    it('should dismiss modal if user clicked from mobile input screen', () => {
      component.optInFlowState = OptInFlowState.MOBILE_INPUT;
      component.goBack();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      expect(trackingService.skipOptInFlow).toHaveBeenCalledTimes(1);
    });

    it('should dismiss modal if user clicked from success screen', () => {
      component.optInFlowState = OptInFlowState.SUCCESS;
      component.goBack();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        action: 'SUCCESS',
      });
      expect(trackingService.optInFlowSuccess).toHaveBeenCalledOnceWith({
        message: 'SUCCESS',
      });
    });
  });

  describe('validateInput():', () => {
    it('should set mobileNumberError if mobile number field is empty', () => {
      component.mobileNumberInputValue = '';
      expect(component.validateInput());
      expect(component.mobileNumberError).toBe('Please enter mobile number');
    });

    it('should set mobileNumberError if mobile number is invalid', () => {
      component.mobileNumberInputValue = '1234567890';
      expect(component.validateInput());
      expect(component.mobileNumberError).toBe(
        'Please enter a valid number with +1 country code. Try re-entering your number.',
      );
    });

    it('should set mobileNumberError if mobileNumberInputValue is null', () => {
      component.mobileNumberInputValue = null;
      expect(component.validateInput());
      expect(component.mobileNumberError).toBe('Please enter mobile number');
    });

    it('should set mobileNumberError if mobileNumberInputValue does not starts with +1', () => {
      component.mobileNumberInputValue = '+911234567890';
      expect(component.validateInput());
      expect(component.mobileNumberError).toBe(
        'Please enter a valid number with +1 country code. Try re-entering your number.',
      );
    });
  });

  describe('saveMobileNumber():', () => {
    beforeEach(() => {
      component.extendedOrgUser = cloneDeep(eouRes2);
      component.mobileNumberInputValue = '123456';
      spyOn(component, 'resendOtp');
      authService.refreshEou.and.returnValue(of(eouRes2));
      orgUserService.postOrgUser.and.returnValue(of(eouRes2.ou));
      spyOn(component, 'validateInput');
    });

    it('should close the modal if user has not changed the verified mobile number', () => {
      const mockEou = cloneDeep(eouRes2);
      mockEou.ou.mobile_verified = true;
      component.extendedOrgUser = mockEou;
      component.saveMobileNumber();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      expect(orgUserService.postOrgUser).not.toHaveBeenCalled();
    });

    it('should update mobile number if mobileNumberError is null', () => {
      component.saveMobileNumber();
      expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith({
        ...eouRes2.ou,
        mobile: '123456',
      });
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(component.resendOtp).toHaveBeenCalledOnceWith('INITIAL');
    });

    it('should not update mobile number if mobileNumberError is not null', () => {
      component.mobileNumberError = 'Invalid mobile number';
      component.saveMobileNumber();
      expect(orgUserService.postOrgUser).not.toHaveBeenCalled();
      expect(authService.refreshEou).not.toHaveBeenCalled();
      expect(component.resendOtp).not.toHaveBeenCalled();
    });

    it('should set sendCodeLoading to false if API call fails', () => {
      orgUserService.postOrgUser.and.returnValue(throwError('error'));
      component.saveMobileNumber();
      expect(authService.refreshEou).not.toHaveBeenCalled();
      expect(component.sendCodeLoading).toBeFalse();
    });
  });

  describe('resendOtp():', () => {
    beforeEach(() => {
      component.extendedOrgUser = cloneDeep(eouRes2);
      component.mobileNumberInputValue = '123456';
      spyOn(component, 'startTimer');
      spyOn(component, 'toastWithoutCTA');
      mobileNumberVerificationService.sendOtp.and.returnValue(of({ attempts_left: 3 }));
      component.optInFlowState = OptInFlowState.MOBILE_INPUT;
      component.ngOtpInput = {
        setValue: jasmine.createSpy('setValue'),
      } as any;
    });

    it('should set otp input screen and start timer if there are attempts left', () => {
      component.resendOtp('INITIAL');
      expect(component.optInFlowState).toEqual(OptInFlowState.OTP_VERIFICATION);
      expect(mobileNumberVerificationService.sendOtp).toHaveBeenCalledTimes(1);
      expect(component.startTimer).toHaveBeenCalledTimes(1);
      expect(component.sendCodeLoading).toBeFalse();
    });

    it('should reset otp input and show toast message if there are attempts left', () => {
      component.resendOtp('CLICK');
      expect(component.optInFlowState).toEqual(OptInFlowState.MOBILE_INPUT);
      expect(mobileNumberVerificationService.sendOtp).toHaveBeenCalledTimes(1);
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'Code sent successfully',
        ToastType.SUCCESS,
        'msb-success-with-camera-icon',
      );
      expect(component.sendCodeLoading).toBeFalse();
    });

    it('should disable resent OTP if attempts are exhausted', () => {
      mobileNumberVerificationService.sendOtp.and.returnValue(of({ attempts_left: 0 }));
      component.resendOtp('CLICK');
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'You have reached the limit for 6 digit code requests. Try again after 24 hours.',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
      expect(component.sendCodeLoading).toBeFalse();
      expect(component.disableResendOtp).toBeTrue();
    });

    it('should throw maximum limit reached error if error message consist of out of attempts', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'out of attempts',
        },
      });
      mobileNumberVerificationService.sendOtp.and.returnValue(throwError(error));
      component.resendOtp('CLICK');
      expect(trackingService.optInFlowError).toHaveBeenCalledOnceWith({
        message: 'OTP_MAX_ATTEMPTS_REACHED',
      });
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'You have reached the limit for 6 digit code requests. Try again after 24 hours.',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
      expect(component.disableResendOtp).toBeTrue();
    });

    it('should throw maximum limit reached error if error message consist of max send attempts reached', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'max send attempts reached',
        },
      });
      mobileNumberVerificationService.sendOtp.and.returnValue(throwError(error));
      component.ngOtpInput = null;
      component.resendOtp('CLICK');
      expect(trackingService.optInFlowError).toHaveBeenCalledOnceWith({
        message: 'OTP_MAX_ATTEMPTS_REACHED',
      });
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'You have reached the limit for 6 digit code requests. Try again after 24 hours.',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
      expect(component.disableResendOtp).toBeTrue();
    });

    it('should throw invalid mobile number error if error message consist of invalid mobile number', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'invalid parameter',
        },
      });
      mobileNumberVerificationService.sendOtp.and.returnValue(throwError(error));
      component.resendOtp('CLICK');
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'Invalid mobile number. Please try again.',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
    });

    it('should throw code expired error if error message consist of expired', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'expired',
        },
      });
      mobileNumberVerificationService.sendOtp.and.returnValue(throwError(error));
      component.resendOtp('CLICK');
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'The code has expired. Please request a new one.',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
    });

    it('should throw code expired error if error message consist of expired incase otp input value is null', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'expired',
        },
      });
      mobileNumberVerificationService.sendOtp.and.returnValue(throwError(error));
      component.ngOtpInput = null;
      component.resendOtp('CLICK');
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'The code has expired. Please request a new one.',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
    });

    it('should throw invalid code error if message is invalid code', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          message: 'invalid code',
        },
      });
      mobileNumberVerificationService.sendOtp.and.returnValue(throwError(error));
      component.resendOtp('CLICK');
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'Code is invalid',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
    });

    it('should throw invalid code error if error message is not defined', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {},
      });
      mobileNumberVerificationService.sendOtp.and.returnValue(throwError(error));
      component.ngOtpInput = null;
      component.resendOtp('CLICK');
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'Code is invalid',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
    });
  });

  describe('verifyOtp():', () => {
    beforeEach(() => {
      component.ngOtpInput = {
        setValue: jasmine.createSpy('setValue'),
      } as any;

      mobileNumberVerificationService.verifyOtp.and.returnValue(of({ message: 'success' }));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      spyOn(component, 'toastWithoutCTA');
      component.optInFlowState = OptInFlowState.OTP_VERIFICATION;
      authService.refreshEou.and.returnValue(of(eouRes2));
    });

    it('should show success screen and track event if otp is verified', fakeAsync(() => {
      component.verifyOtp('123456');
      tick(100);

      expect(component.optInFlowState).toBe(OptInFlowState.SUCCESS);
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Verifying code...');
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(userEventService.clearTaskCache).toHaveBeenCalledTimes(1);
    }));

    it('should reset otp if API call fails', fakeAsync(() => {
      mobileNumberVerificationService.verifyOtp.and.returnValue(throwError('error'));
      component.verifyOtp('123456');
      tick(100);

      expect(component.ngOtpInput.setValue).toHaveBeenCalledOnceWith('');
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Verifying code...');
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        'Code is invalid',
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
      expect(component.optInFlowState).toBe(OptInFlowState.OTP_VERIFICATION);
    }));
  });

  it('onOtpChange(): should call verifyOtp if otp length is 6', () => {
    spyOn(component, 'verifyOtp');
    component.onOtpChange('123456');
    expect(component.verifyOtp).toHaveBeenCalledOnceWith('123456');
  });

  it('toastWithoutCTA(): should show toast message', () => {
    snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes2);
    component.toastWithoutCTA('message', ToastType.SUCCESS, 'icon');
    expect(matSnackbar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarPropertiesRes2,
      panelClass: ['icon'],
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'message',
    });
  });

  it('startTimer(): should start a timer and clear it after 30 seconds', fakeAsync(() => {
    spyOn(window, 'setInterval').and.callThrough();
    spyOn(window, 'clearInterval').and.callThrough();

    component.startTimer();
    expect(setInterval).toHaveBeenCalledOnceWith(jasmine.any(Function), 1000);
    expect(component.otpTimer).toBe(30);
    expect(component.showOtpTimer).toBeTrue();

    tick(1000);
    expect(component.otpTimer).toBe(29);

    tick(29000);
    expect(component.otpTimer).toBe(0);
    expect(clearInterval).toHaveBeenCalledOnceWith(jasmine.any(Number));
    expect(component.showOtpTimer).toBeFalse();
  }));

  it('openHelpArticle(): should open help article in browser', () => {
    component.openHelpArticle();
    expect(trackingService.clickedOnHelpArticle).toHaveBeenCalledTimes(1);
    expect(browserHandlerService.openLinkWithToolbarColor).toHaveBeenCalledOnceWith(
      '#280a31',
      'https://www.fylehq.com/help/en/articles/8045065-submit-your-receipts-via-text-message',
    );
  });

  it('onGotItClicked(): should dismiss the modal and track opt-in event', () => {
    component.onGotItClicked();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      action: 'SUCCESS',
    });
    expect(trackingService.optInFlowSuccess).toHaveBeenCalledOnceWith({
      message: 'SUCCESS',
    });
  });

  it('ionViewWillLeave(): should unsubscribe hardwareBackButtonAction', () => {
    component.hardwareBackButtonAction = new Subscription();
    spyOn(component.hardwareBackButtonAction, 'unsubscribe');
    component.ionViewWillLeave();
    expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
