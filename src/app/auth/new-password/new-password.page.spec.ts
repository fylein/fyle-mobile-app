import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NewPasswordPage } from './new-password.page';
import { AuthService } from 'src/app/core/services/auth.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoginInfoService } from 'src/app/core/services/login-info.service';
import { UntypedFormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { RouterTestingModule } from '@angular/router/testing';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';

describe('NewPasswordPage', () => {
  let component: NewPasswordPage;
  let fixture: ComponentFixture<NewPasswordPage>;
  let authService: jasmine.SpyObj<AuthService>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let loginInfoService: jasmine.SpyObj<LoginInfoService>;
  let router: jasmine.SpyObj<Router>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarPropertiesService: jasmine.SpyObj<SnackbarPropertiesService>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshEou']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['resetPassword']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['onSignin', 'resetPassword', 'eventTrack']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const loginInfoServiceSpy = jasmine.createSpyObj('LoginInfoService', ['addLoginInfo']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);

    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, RouterTestingModule, NewPasswordPage, getTranslocoTestingModule()],
      providers: [
        UntypedFormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: RouterAuthService, useValue: routerAuthServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: LoginInfoService, useValue: loginInfoServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesServiceSpy },
        { provide: Router, useValue: routerSpy },
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
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    loginInfoService = TestBed.inject(LoginInfoService) as jasmine.SpyObj<LoginInfoService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarPropertiesService = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changePassword', () => {
    const passwordValue = 'DummyPassword@123';
    const refreshToken = 'token123';
    const resetPasswordRes = { ...apiEouRes, refresh_token: refreshToken };

    it('should change the password and show success message on success', fakeAsync(() => {
      const message = 'Password changed successfully';
      spyOn(component, 'trackLoginInfo');
      routerAuthService.resetPassword.and.returnValue(of(resetPasswordRes));
      authService.refreshEou.and.returnValue(of(apiEouRes));
      deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      component.fg.controls.password.setValue(passwordValue);
      fixture.detectChanges();
      const newPasswordButton = getElementBySelector(fixture, '.btn-primary') as HTMLButtonElement;
      newPasswordButton.click();
      tick(500);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.resetPassword).toHaveBeenCalledOnceWith(refreshToken, passwordValue);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(trackingService.onSignin).toHaveBeenCalledOnceWith(resetPasswordRes.us.id);
      expect(trackingService.resetPassword).toHaveBeenCalledTimes(1);
      expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
      expect(snackbarPropertiesService.setSnackbarProperties).toHaveBeenCalledOnceWith('success', { message });
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarPropertiesService.setSnackbarProperties('success', { message }),
        panelClass: ['msb-success'],
      });
    }));

    it('should show error message on failure', fakeAsync(() => {
      const message = 'Something went wrong. Please try after some time.';
      spyOn(component, 'trackLoginInfo');
      routerAuthService.resetPassword.and.rejectWith();
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();

      component.fg.controls.password.setValue(passwordValue);
      fixture.detectChanges();
      const newPasswordButton = getElementBySelector(fixture, '.btn-primary') as HTMLButtonElement;
      newPasswordButton.click();
      tick(500);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.resetPassword).toHaveBeenCalledOnceWith(refreshToken, passwordValue);
      expect(authService.refreshEou).not.toHaveBeenCalled();
      expect(trackingService.onSignin).not.toHaveBeenCalled();
      expect(trackingService.resetPassword).not.toHaveBeenCalled();
      expect(component.trackLoginInfo).not.toHaveBeenCalled();
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarPropertiesService.setSnackbarProperties('failure', { message }),
        panelClass: ['msb-failure'],
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
    expect(trackingService.eventTrack).toHaveBeenCalledTimes(2);
    expect(loginInfoService.addLoginInfo).toHaveBeenCalledOnceWith('5.50.0', mockDate);
  }));

  it('redirectToSignIn(): should navigate to the sign-in page', () => {
    component.redirectToSignIn();
    // @ts-ignore
    expect(component.router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'sign_in']); // Should navigate to the correct route
  });

  describe('checkPasswordValidity():', () => {
    it('should return null when isPasswordValid is true', () => {
      component.isPasswordValid = true;

      const result = component.checkPasswordValidity();

      expect(result).toBeNull(); // No errors
    });

    it('should return an error object when isPasswordValid is false', () => {
      component.isPasswordValid = false;

      const result = component.checkPasswordValidity();

      expect(result).toEqual({ invalidPassword: true }); // Error object
    });
  });

  describe('validatePasswordEquality():', () => {
    it('should return null when password and confirmPassword match', () => {
      component.fg.controls.password.setValue('StrongPassword@123');
      component.fg.controls.confirmPassword.setValue('StrongPassword@123');

      const result = component.validatePasswordEquality();

      expect(result).toBeNull(); // No errors
    });

    it('should return an error object when password and confirmPassword do not match', () => {
      component.fg.controls.password.setValue('StrongPassword@123');
      component.fg.controls.confirmPassword.setValue('DifferentPassword@123');

      const result = component.validatePasswordEquality();

      expect(result).toEqual({ passwordMismatch: true });
    });

    it('should return null when password or confirmPassword is empty', () => {
      component.fg.controls.password.setValue('');
      component.fg.controls.confirmPassword.setValue('');

      const result = component.validatePasswordEquality();

      expect(result).toBeNull();
    });
  });

  describe('onPasswordValid():', () => {
    it('should set isPasswordValid to true when called with true', () => {
      component.onPasswordValid(true);
      expect(component.isPasswordValid).toBeTrue();
    });

    it('should set isPasswordValid to false when called with false', () => {
      component.onPasswordValid(false);
      expect(component.isPasswordValid).toBeFalse();
    });
  });

  describe('setPasswordTooltip():', () => {
    it('should set showPasswordTooltip to true when called with true', () => {
      component.setPasswordTooltip(true);
      expect(component.showPasswordTooltip).toBeTrue();
    });

    it('should set showPasswordTooltip to false when called with false', () => {
      component.setPasswordTooltip(false);
      expect(component.showPasswordTooltip).toBeFalse();
    });
  });
});
