import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';
import { VerifyNumberPopoverComponent } from './verify-number-popover.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { of, throwError } from 'rxjs';
import { FyAlertInfoComponent } from 'src/app/shared/components/fy-alert-info/fy-alert-info.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FormButtonValidationDirective } from 'src/app/shared/directive/form-button-validation.directive';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { ErrorType } from './error-type.model';

describe('VerifyNumberPopoverComponent', () => {
  let component: VerifyNumberPopoverComponent;
  let fixture: ComponentFixture<VerifyNumberPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let mobileNumberVerificationService: jasmine.SpyObj<MobileNumberVerificationService>;
  let resendOtpSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const mobileNumberVerificationServiceSpy = jasmine.createSpyObj('MobileNumberVerificationService', [
      'sendOtp',
      'verifyOtp',
    ]);

    TestBed.configureTestingModule({
      declarations: [VerifyNumberPopoverComponent, FyAlertInfoComponent, FormButtonValidationDirective],
      imports: [IonicModule.forRoot(), FormsModule, MatIconModule, MatIconTestingModule],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: MobileNumberVerificationService, useValue: mobileNumberVerificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyNumberPopoverComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    mobileNumberVerificationService = TestBed.inject(
      MobileNumberVerificationService
    ) as jasmine.SpyObj<MobileNumberVerificationService>;

    component.extendedOrgUser = apiEouRes;
    component.showOtpTimer = false;
    component.disableResendOtp = false;
    component.error = null;
    component.value = '';
    resendOtpSpy = spyOn(component, 'resendOtp');

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should execute on component initialization', () => {
    expect(component.infoBoxText).toBe('Please verify your mobile number using the 6-digit OTP sent to 123456');
    expect(component.resendOtp).toHaveBeenCalledOnceWith();
  });

  it('ngAfterViewInit(): should focus on input element on init', fakeAsync(() => {
    const inputElement = getElementBySelector(fixture, 'input') as HTMLInputElement;
    component.inputEl.nativeElement = inputElement;
    component.error = null;
    component.ngAfterViewInit();
    tick(200);

    expect(document.activeElement).toEqual(inputElement);
  }));

  it('validateInput(): should set error message if input is invalid', () => {
    const valueErrorMapping = [
      {
        value: '123456',
        error: false,
      },
      {
        value: '12345',
        error: true,
      },
      {
        value: '123+98',
        error: true,
      },
      {
        value: null,
        error: true,
      },
    ];

    valueErrorMapping.forEach((valueError) => {
      component.error = null;
      component.value = valueError.value;
      component.validateInput();
      expect(component.error).toEqual(valueError.error ? 'Please enter 6 digit OTP' : null);
    });
  });

  it('goBack(): Should dismiss modal', () => {
    const backButton = getElementBySelector(fixture, 'ion-button') as HTMLIonButtonElement;
    click(backButton);
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ action: 'BACK' });
  });

  it('onFocus(): should clear the error message', () => {
    spyOn(component, 'onFocus').and.callThrough();
    component.error = 'Please enter a valid OTP';

    const inputElement = getElementBySelector(fixture, 'input') as HTMLInputElement;
    inputElement.dispatchEvent(new FocusEvent('focus'));

    expect(component.onFocus).toHaveBeenCalledOnceWith();
    expect(component.error).toBeNull();
  });

  describe('resendOtp(): ', () => {
    let resentOtpCta: HTMLButtonElement;
    beforeEach(() => {
      spyOn(component, 'setError');
      spyOn(component, 'startTimer');

      resentOtpCta = getElementBySelector(
        fixture,
        '.verify-number-popover__input-container__label__resend'
      ) as HTMLButtonElement;
    });

    it('should resend otp and show remaining attempts when cta is clicked', () => {
      //Called once inside ngOnInit
      expect(component.resendOtp).toHaveBeenCalledOnceWith();
      mobileNumberVerificationService.sendOtp.and.returnValue(
        of({
          attempts_left: 3,
        })
      );
      resendOtpSpy.and.callThrough();
      click(resentOtpCta);

      expect(component.resendOtp).toHaveBeenCalledTimes(2);
      expect(mobileNumberVerificationService.sendOtp).toHaveBeenCalledOnceWith();
      expect(component.setError).toHaveBeenCalledOnceWith('ATTEMPTS_LEFT', 3);
      expect(component.startTimer).toHaveBeenCalledOnceWith();
    });

    it('should show limit reached error message if no attempts left', () => {
      mobileNumberVerificationService.sendOtp.and.returnValue(
        of({
          attempts_left: 0,
        })
      );
      resendOtpSpy.and.callThrough();
      click(resentOtpCta);

      expect(mobileNumberVerificationService.sendOtp).toHaveBeenCalledOnceWith();
      expect(component.setError).toHaveBeenCalledOnceWith('LIMIT_REACHED');
      expect(component.disableResendOtp).toBeTrue();
    });

    it('should show limit reached error message if api throws 400 with out of attempts message', () => {
      mobileNumberVerificationService.sendOtp.and.returnValue(
        throwError(() => ({
          status: 400,
          error: {
            message: 'Out of attempts',
          },
        }))
      );
      resendOtpSpy.and.callThrough();
      click(resentOtpCta);

      expect(mobileNumberVerificationService.sendOtp).toHaveBeenCalledOnceWith();
      expect(component.setError).toHaveBeenCalledOnceWith('LIMIT_REACHED');
      expect(component.disableResendOtp).toBeTrue();
    });

    it('should show limit reached error message if api throws 400 with max send attempts reached message', () => {
      mobileNumberVerificationService.sendOtp.and.returnValue(
        throwError(() => ({
          status: 400,
          error: {
            message: 'Max send attempts reached',
          },
        }))
      );
      resendOtpSpy.and.callThrough();
      click(resentOtpCta);

      expect(mobileNumberVerificationService.sendOtp).toHaveBeenCalledOnceWith();
      expect(component.setError).toHaveBeenCalledOnceWith('LIMIT_REACHED');
      expect(component.disableResendOtp).toBeTrue();
    });

    it('should show invalid mobile number error message if api throws 400 with invalid parameter message', () => {
      mobileNumberVerificationService.sendOtp.and.returnValue(
        throwError(() => ({
          status: 400,
          error: {
            message: 'Invalid parameter `To`: +9112345667899',
          },
        }))
      );
      resendOtpSpy.and.callThrough();
      click(resentOtpCta);

      expect(mobileNumberVerificationService.sendOtp).toHaveBeenCalledOnceWith();
      expect(component.setError).toHaveBeenCalledOnceWith('INVALID_MOBILE_NUMBER');
      expect(component.disableResendOtp).toBeFalsy();
    });
  });

  describe('verifyOtp(): ', () => {
    let verifyCta: HTMLButtonElement;
    beforeEach(() => {
      spyOn(component, 'verifyOtp').and.callThrough();
      spyOn(component, 'validateInput');

      component.error = null;
      verifyCta = getElementBySelector(fixture, '.verify-number-popover__toolbar__btn') as HTMLButtonElement;
    });

    it('should verify otp if input is valid', () => {
      mobileNumberVerificationService.verifyOtp.and.returnValue(of({}));
      component.value = '123456';

      click(verifyCta);
      fixture.detectChanges();
      const errorElement = getElementBySelector(
        fixture,
        '.verify-number-popover__input-container__error'
      ) as HTMLSpanElement;

      expect(component.verifyOtp).toHaveBeenCalledOnceWith();
      expect(component.validateInput).toHaveBeenCalledOnceWith();

      expect(mobileNumberVerificationService.verifyOtp).toHaveBeenCalledOnceWith(component.value);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ action: 'SUCCESS' });
      expect(errorElement).toBeNull();
    });

    it('should set error message if otp is invalid', () => {
      const errorMessage = 'Incorrect mobile number or OTP. Please try again.';
      mobileNumberVerificationService.verifyOtp.and.returnValue(throwError(() => errorMessage));
      component.value = '567889';

      click(verifyCta);
      fixture.detectChanges();
      const errorElement = getElementBySelector(
        fixture,
        '.verify-number-popover__input-container__error'
      ) as HTMLSpanElement;

      expect(mobileNumberVerificationService.verifyOtp).toHaveBeenCalledOnceWith(component.value);
      expect(component.error).toEqual(errorMessage);
      expect(getTextContent(errorElement)).toEqual(errorMessage);
    });

    it('should not make api call if input is invalid', () => {
      component.error = 'Please enter 6 digit OTP';
      component.value = '123';

      click(verifyCta);
      fixture.detectChanges();
      const errorElement = getElementBySelector(
        fixture,
        '.verify-number-popover__input-container__error'
      ) as HTMLSpanElement;

      expect(mobileNumberVerificationService.verifyOtp).not.toHaveBeenCalled();
      expect(popoverController.dismiss).not.toHaveBeenCalled();
      expect(getTextContent(errorElement)).toEqual(component.error);
    });
  });

  it('setError(): should set correct error messages', () => {
    const errorMappings = [
      {
        type: 'LIMIT_REACHED',
        error: 'You have exhausted the limit to request OTP for your mobile number. Please try again after 24 hours.',
      },
      {
        type: 'INVALID_MOBILE_NUMBER',
        error: 'Invalid mobile number. Please try again',
      },
      {
        type: 'INVALID_OTP',
        error: 'Incorrect mobile number or OTP. Please try again.',
      },
      {
        type: 'INVALID_INPUT',
        error: 'Please enter 6 digit OTP',
      },
      {
        type: 'ATTEMPTS_LEFT',
        value: 4,
        error: 'You have 4 attempts left to verify your mobile number.',
      },
      {
        type: 'ATTEMPTS_LEFT',
        value: 1,
        error: 'You have 1 attempt left to verify your mobile number.',
      },
    ];

    errorMappings.forEach((errorMapping) => {
      component.setError(errorMapping.type as ErrorType, errorMapping.value);
      expect(component.error).toEqual(errorMapping.error);
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
});
