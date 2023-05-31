import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { NewPasswordPage } from './new-password.page';
import { AuthService } from 'src/app/core/services/auth.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoginInfoService } from 'src/app/core/services/login-info.service';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { RouterTestingModule } from '@angular/router/testing';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PopupComponent } from './popup/popup.component';

describe('NewPasswordPage', () => {
  let component: NewPasswordPage;
  let fixture: ComponentFixture<NewPasswordPage>;
  let authService: jasmine.SpyObj<AuthService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let loginInfoService: jasmine.SpyObj<LoginInfoService>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['newRefreshToken']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['resetPassword']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['onSignin', 'resetPassword', 'eventTrack']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const loginInfoServiceSpy = jasmine.createSpyObj('LoginInfoService', ['addLoginInfo']);

    TestBed.configureTestingModule({
      declarations: [NewPasswordPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: RouterAuthService, useValue: routerAuthServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: LoginInfoService, useValue: loginInfoServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { refreshToken: 'token123' },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NewPasswordPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    loginInfoService = TestBed.inject(LoginInfoService) as jasmine.SpyObj<LoginInfoService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit():', () => {
    it('should initialize the form and observables', () => {
      component.ngOnInit();

      expect(component.fg).toBeDefined();
      expect(component.lengthValidationDisplay$).toBeDefined();
      expect(component.uppercaseValidationDisplay$).toBeDefined();
      expect(component.numberValidationDisplay$).toBeDefined();
      expect(component.specialCharValidationDisplay$).toBeDefined();
      expect(component.lowercaseValidationDisplay$).toBeDefined();
    });

    it('should validate password length of 12 characters', () => {
      const checkmarkIcon = getElementBySelector(fixture, '[data-testid="lengthValidation_correct"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('123456789012');
      expect(checkmarkIcon).toBeDefined();
    });

    it('should validate password length of 32 characters', () => {
      const checkmarkIcon = getElementBySelector(fixture, '[data-testid="lengthValidation_correct"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('1234567890123456789012345678901');
      expect(checkmarkIcon).toBeDefined();
    });

    it('should not validate password length of less 12 characters', () => {
      const closeIcon = getElementBySelector(fixture, '[data-testid="lengthValidation_incorrect"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('12345');
      expect(closeIcon).toBeDefined();
    });

    it('should not validate password length of more 32 characters', () => {
      const closeIcon = getElementBySelector(fixture, '[data-testid="lengthValidation_incorrect"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('12345678901234567890123456789012');
      expect(closeIcon).toBeDefined();
    });

    it('should validate the presence of an uppercase letter in password', () => {
      const checkmarkIcon = getElementBySelector(fixture, '[data-testid="uppercaseValidation_correct"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('PasswordWithUpperCase');
      expect(checkmarkIcon).toBeDefined();
    });

    it('should not validate the absence of an uppercase letter in password', () => {
      const closeIcon = getElementBySelector(fixture, '[data-testid="uppercaseValidation_incorrect"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('passwordwithoutuppercase');
      expect(closeIcon).toBeDefined();
    });

    it('should validate the presence of a number in password', () => {
      const checkmarkIcon = getElementBySelector(fixture, '[data-testid="numberValidation_correct"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('PasswordWithNumber123');
      expect(checkmarkIcon).toBeDefined();
    });

    it('should not validate the absence of a number in password', () => {
      const closeIcon = getElementBySelector(fixture, '[data-testid="numberValidation_incorrect"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('PasswordWithoutNumber');
      expect(closeIcon).toBeDefined();
    });

    it('should validate the presence of a special character in password', () => {
      const checkmarkIcon = getElementBySelector(fixture, '[data-testid="specialcharValidation_correct"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('PasswordWith@Special#Char');
      expect(checkmarkIcon).toBeDefined();
    });

    it('should not validate the absence of a special character in password', () => {
      const closeIcon = getElementBySelector(fixture, '[data-testid="specialcharValidation_incorrect"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('PasswordWithoutSpecialChar');
      expect(closeIcon).toBeDefined();
    });

    it('should validate the presence of a lowercase letter in password', () => {
      const checkmarkIcon = getElementBySelector(fixture, '[data-testid="lowercaseValidation_correct"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('PasswordWithLowerCase');
      expect(checkmarkIcon).toBeDefined();
    });

    it('should not validate the absence of a lowercase letter in password', () => {
      const closeIcon = getElementBySelector(fixture, '[data-testid="lowercaseValidation_incorrect"]');
      const passwordControl = component.fg.controls.password as FormControl;

      passwordControl.setValue('PASSWORDWITHOUTLOWERCASE');
      expect(closeIcon).toBeDefined();
    });
  });

  describe('changePassword', () => {
    const passwordValue = 'DummyPassword@123';
    const refreshToken = 'token123';
    const resetPasswordRes = { ...apiEouRes, refresh_token: refreshToken };

    it('should change the password and show success message on success', fakeAsync(() => {
      spyOn(component, 'trackLoginInfo');
      routerAuthService.resetPassword.and.returnValue(of(resetPasswordRes));
      authService.newRefreshToken.and.returnValue(of(apiEouRes));
      const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present']);
      popoverController.create.and.returnValue(popoverSpy);
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      component.fg.controls.password.setValue(passwordValue);
      fixture.detectChanges();
      const newPasswordButton = getElementBySelector(fixture, '#new-password--btn-sign-in') as HTMLButtonElement;
      newPasswordButton.click();
      tick(500);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.resetPassword).toHaveBeenCalledOnceWith(refreshToken, passwordValue);
      expect(authService.newRefreshToken).toHaveBeenCalledOnceWith('token123');
      expect(trackingService.onSignin).toHaveBeenCalledOnceWith('ajain@fyle.in');
      expect(trackingService.resetPassword).toHaveBeenCalledTimes(1);
      expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupComponent,
        componentProps: {
          header: 'Password changed successfully',
          route: ['/', 'auth', 'switch_org'],
        },
        cssClass: 'dialog-popover',
      });
    }));

    it('should show error message on failure', fakeAsync(() => {
      spyOn(component, 'trackLoginInfo');
      authService.newRefreshToken.and.rejectWith();
      routerAuthService.resetPassword.and.rejectWith();
      const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present']);
      popoverController.create.and.returnValue(popoverSpy);
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      component.fg.controls.password.setValue(passwordValue);
      fixture.detectChanges();
      const newPasswordButton = getElementBySelector(fixture, '#new-password--btn-sign-in') as HTMLButtonElement;
      newPasswordButton.click();
      tick(500);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.resetPassword).toHaveBeenCalledOnceWith(refreshToken, passwordValue);
      expect(authService.newRefreshToken).not.toHaveBeenCalledOnceWith('token123');
      expect(trackingService.onSignin).not.toHaveBeenCalled();
      expect(trackingService.resetPassword).not.toHaveBeenCalled();
      expect(component.trackLoginInfo).not.toHaveBeenCalled();
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupComponent,
        componentProps: {
          header: 'Setting new password failed. Please try again later.',
          route: ['/', 'auth', 'sign_in'],
        },
        cssClass: 'dialog-popover',
      });
    }));
  });

  it('trackLoginInfo(): should track login info', fakeAsync(() => {
    deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
    trackingService.eventTrack.and.resolveTo();
    loginInfoService.addLoginInfo.and.resolveTo();
    const mockDate = new Date();

    component.trackLoginInfo();
    tick(500);

    expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(1);
    expect(trackingService.eventTrack).toHaveBeenCalledOnceWith('Added Login Info', { label: '5.50.0' });
    expect(loginInfoService.addLoginInfo).toHaveBeenCalledOnceWith('5.50.0', mockDate);
  }));
});
