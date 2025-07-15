import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NetworkService } from 'src/app/core/services/network.service';
import { ToastController } from '@ionic/angular';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, UrlSerializer } from '@angular/router';
import { TrackingService } from '../../core/services/tracking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { InvitedUserPage } from './invited-user.page';
import { UntypedFormBuilder } from '@angular/forms';
import { of, take } from 'rxjs';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  currentEouRes,
  extendedOrgUserResponse,
  postUserResponse,
} from 'src/app/core/test-data/org-user.service.spec.data';
import { cloneDeep } from 'lodash';
import { eouRes3 } from 'src/app/core/mock-data/extended-org-user.data';
import { OrgService } from 'src/app/core/services/org.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { RouterTestingModule } from '@angular/router/testing';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { OnboardingState } from 'src/app/core/models/onboarding-state.enum';
import { onboardingStatusData } from 'src/app/core/mock-data/onboarding-status.data';
import { orgSettingsData } from 'src/app/core/test-data/org-settings.service.spec.data';

describe('InvitedUserPage', () => {
  let component: InvitedUserPage;
  let fixture: ComponentFixture<InvitedUserPage>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let fb: UntypedFormBuilder;
  let toastController: jasmine.SpyObj<ToastController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let spenderOnboardingService: jasmine.SpyObj<SpenderOnboardingService>;

  beforeEach(waitForAsync(() => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postUser', 'markActive']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'refreshEou']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'showToastMessage',
      'setupComplete',
      'activated',
      'eventTrack',
    ]);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'checkForRedirectionToOnboarding',
    ]);
    TestBed.configureTestingModule({
      declarations: [InvitedUserPage],
      imports: [IonicModule.forRoot(), MatIconTestingModule, RouterTestingModule],
      providers: [
        UntypedFormBuilder,
        UrlSerializer,
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: ToastController, useValue: toastController },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: SpenderOnboardingService, useValue: spenderOnboardingServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    fb = TestBed.inject(UntypedFormBuilder);
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService) as jasmine.SpyObj<SpenderOnboardingService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;

    networkService.connectivityWatcher.and.returnValue(new EventEmitter());
    networkService.isOnline.and.returnValue(of(true));
    authService.getEou.and.resolveTo(currentEouRes);
    fixture = TestBed.createComponent(InvitedUserPage);
    component = fixture.componentInstance;
    component.isConnected$ = of(true);
    fixture.detectChanges();
    spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should set the fullname value from eou$ and setup network watcher', fakeAsync(() => {
    networkService.isOnline.and.returnValue(of(true));
    const eventEmitterMock = new EventEmitter<boolean>();
    networkService.connectivityWatcher.and.returnValue(eventEmitterMock);
    component.eou$ = of(currentEouRes);
    component.fg.controls.fullName.setValue('Abhishek Jain');
    component.ngOnInit();
    tick(500);
    component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
      expect(connectionStatus).toBeTrue();
    });
    expect(component.fg.controls.fullName.value).toEqual(currentEouRes.us.full_name);
  }));

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

  describe('saveData():', () => {
    it('should navigate to dashboard when form fields are valid', fakeAsync(() => {
      spyOn(component.fg, 'markAllAsTouched');
      component.isPasswordValid = true;
      component.fg.controls.fullName.setValue('John Doe');
      component.fg.controls.password.setValue('StrongPassword@123');
      component.fg.controls.confirmPassword.setValue('StrongPassword@123');
      component.eou$ = of(cloneDeep(currentEouRes));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      authService.refreshEou.and.returnValue(of(eouRes3));
      orgUserService.postUser.and.returnValue(of(postUserResponse));
      orgUserService.markActive.and.returnValue(of(extendedOrgUserResponse));

      const updatedEou = {
        ...currentEouRes,
        us: {
          ...currentEouRes.us,
          full_name: 'John Doe',
          password: 'StrongPassword@123',
        },
      };

      component.saveData();
      fixture.detectChanges();
      tick(500);
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(component.fg.valid).toBeTrue();
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);

      component.eou$.subscribe((exOrgUser) => {
        expect(exOrgUser.us).toEqual(updatedEou.us);
        expect(orgUserService.postUser).toHaveBeenCalledOnceWith(updatedEou.us);
      });
      expect(trackingService.setupComplete).toHaveBeenCalledTimes(1);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(orgUserService.markActive).toHaveBeenCalledTimes(1);
      expect(trackingService.activated).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
      tick(500);
    }));

    it('should show error snackbar  when password is invalid', fakeAsync(() => {
      spyOn(component.fg, 'markAllAsTouched');
      component.fg.controls.fullName.setValue('John Doe');
      component.fg.controls.password.setValue('');
      component.fg.controls.confirmPassword.setValue('');
      const message = 'Please enter a valid password';

      component.saveData();
      tick(500);
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(component.fg.valid).toBeFalse();
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarProperties.setSnackbarProperties('failure', { message }),
        panelClass: ['msb-failure'],
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
    }));

    it('should show error snackbar when name is invalid', fakeAsync(() => {
      spyOn(component.fg, 'markAllAsTouched');
      component.fg.controls.fullName.setValue('');
      component.fg.controls.password.setValue('StrongPassword@123');
      component.fg.controls.confirmPassword.setValue('StrongPassword@123');
      const message = 'Please enter a valid name';

      component.saveData();
      tick(500);
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(component.fg.valid).toBeFalse();
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarProperties.setSnackbarProperties('failure', { message }),
        panelClass: ['msb-failure'],
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
    }));
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

  it('redirectToSignIn(): should navigate to the sign-in page', () => {
    component.redirectToSignIn();
    // @ts-ignore
    expect(component.router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'sign_in']); // Should navigate to the correct route
  });

  it('navigateToDashboard(): should navigate to spender onboarding when onboarding status is not complete', fakeAsync(() => {
    spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(true));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    component.navigateToDashboard();
    tick();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'spender_onboarding']);
  }));
});
