import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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

describe('VerifyNumberPopoverComponent', () => {
  let component: VerifyNumberPopoverComponent;
  let fixture: ComponentFixture<VerifyNumberPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let mobileNumberVerificationService: jasmine.SpyObj<MobileNumberVerificationService>;

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
    spyOn(component, 'resendOtp').and.callThrough();
    mobileNumberVerificationService.sendOtp.and.returnValue(of({}));

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should execute on component initialization', () => {
    expect(component.infoBoxText).toBe('Please verify your mobile number using the 6-digit OTP sent to 123456');
    expect(component.resendOtp).toHaveBeenCalledOnceWith();
  });

  it('ngAfterViewInit(): should focus on input element on init', () => {
    const inputElement = getElementBySelector(fixture, 'input') as HTMLInputElement;
    component.inputEl.nativeElement = inputElement;

    expect(document.activeElement).toBe(inputElement);
  });

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

  it('resendOtp(): should resend otp when cta is clicked', () => {
    //Called once inside ngOnInit
    expect(component.resendOtp).toHaveBeenCalledOnceWith();

    const inputElement = getElementBySelector(
      fixture,
      '.verify-number-popover--input-container__label--resend'
    ) as HTMLButtonElement;
    click(inputElement);

    //Called second time on click
    expect(component.resendOtp).toHaveBeenCalledTimes(2);
    expect(mobileNumberVerificationService.sendOtp).toHaveBeenCalledTimes(2);
  });

  describe('verifyOtp(): ', () => {
    let verifyCta: HTMLButtonElement;
    beforeEach(() => {
      spyOn(component, 'verifyOtp').and.callThrough();
      spyOn(component, 'validateInput');

      component.error = null;
      verifyCta = getElementBySelector(fixture, '.verify-number-popover--toolbar__btn') as HTMLButtonElement;
    });

    it('should verify otp if input is valid', () => {
      mobileNumberVerificationService.verifyOtp.and.returnValue(of({}));
      component.value = '123456';

      click(verifyCta);
      fixture.detectChanges();
      const errorElement = getElementBySelector(
        fixture,
        '.verify-number-popover--input-container__error'
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
        '.verify-number-popover--input-container__error'
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
        '.verify-number-popover--input-container__error'
      ) as HTMLSpanElement;

      expect(mobileNumberVerificationService.verifyOtp).not.toHaveBeenCalled();
      expect(popoverController.dismiss).not.toHaveBeenCalled();
      expect(getTextContent(errorElement)).toEqual(component.error);
    });
  });
});
