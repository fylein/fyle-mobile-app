import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PopoverController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { GoogleAuthService } from 'src/app/core/services/google-auth.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { TrackingService } from '../../core/services/tracking.service';
import { DeviceService } from '../../core/services/device.service';
import { LoginInfoService } from '../../core/services/login-info.service';
import { SignInPage } from './sign-in.page';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subscription, throwError } from 'rxjs';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { ErrorComponent } from './error/error.component';
import { authResData1, authResData2, samlResData1, samlResData2 } from 'src/app/core/mock-data/auth-response.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { SignInPageState } from './sign-in-page-state.enum';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { BackButtonService } from 'src/app/core/services/back-button.service';

describe('SignInPage', () => {
  let component: SignInPage;
  let fixture: ComponentFixture<SignInPage>;
  let formBuilder: jasmine.SpyObj<UntypedFormBuilder>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let googleAuthService: jasmine.SpyObj<GoogleAuthService>;
  let inAppBrowser: jasmine.SpyObj<InAppBrowser>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let loginInfoService: jasmine.SpyObj<LoginInfoService>;
  let inAppBrowserService: jasmine.SpyObj<InAppBrowserService>;
  let platformHandlerService: jasmine.SpyObj<PlatformHandlerService>;
  let backButtonService: jasmine.SpyObj<BackButtonService>;

  beforeEach(waitForAsync(() => {
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', [
      'handleSignInResponse',
      'checkEmailExists',
      'basicSignin',
      'googleSignin',
      'isLoggedIn',
    ]);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshEou']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const googleAuthServiceSpy = jasmine.createSpyObj('GoogleAuthService', ['login']);
    const inAppBrowserSpy = jasmine.createSpyObj('InAppBrowser', ['create']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['onSignin', 'eventTrack']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const loginInfoServiceSpy = jasmine.createSpyObj('LoginInfoService', ['addLoginInfo']);
    const inAppBrowserServiceSpy = jasmine.createSpyObj('InAppBrowserService', ['create']);
    const platformHandlerServiceSpy = jasmine.createSpyObj('PlatformHandlerService', ['registerBackButtonAction']);
    const backButtonServiceSpy = jasmine.createSpyObj('BackButtonService', ['showAppCloseAlert']);
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatButtonModule,
        RouterModule,
        RouterTestingModule,
        SignInPage,
      ],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { email: 'ajain@fyle.in' } } },
        },
        {
          provide: RouterAuthService,
          useValue: routerAuthServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: GoogleAuthService,
          useValue: googleAuthServiceSpy,
        },
        {
          provide: InAppBrowser,
          useValue: inAppBrowserSpy,
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
          provide: LoginInfoService,
          useValue: loginInfoServiceSpy,
        },
        {
          provide: InAppBrowserService,
          useValue: inAppBrowserServiceSpy,
        },
        {
          provide: PlatformHandlerService,
          useValue: platformHandlerServiceSpy,
        },
        {
          provide: BackButtonService,
          useValue: backButtonServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SignInPage);
    component = fixture.componentInstance;

    formBuilder = TestBed.inject(UntypedFormBuilder) as jasmine.SpyObj<UntypedFormBuilder>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    googleAuthService = TestBed.inject(GoogleAuthService) as jasmine.SpyObj<GoogleAuthService>;
    inAppBrowser = TestBed.inject(InAppBrowser) as jasmine.SpyObj<InAppBrowser>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    loginInfoService = TestBed.inject(LoginInfoService) as jasmine.SpyObj<LoginInfoService>;
    inAppBrowserService = TestBed.inject(InAppBrowserService) as jasmine.SpyObj<InAppBrowserService>;
    platformHandlerService = TestBed.inject(PlatformHandlerService) as jasmine.SpyObj<PlatformHandlerService>;
    backButtonService = TestBed.inject(BackButtonService) as jasmine.SpyObj<BackButtonService>;

    loaderService.showLoader.and.returnValue(new Promise(() => {}));
    router.navigate.and.stub();
    routerAuthService.isLoggedIn.and.resolveTo(false);

    component.fg = formBuilder.group({
      email: [Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
      password: ['', Validators.required],
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('handleSamlSignIn(): should handle saml sign in ', fakeAsync(() => {
    const browserSpy = jasmine.createSpyObj('InAppBrowserObject', ['on', 'executeScript', 'close']);
    browserSpy.on.and.returnValue(of(new Event('event')));
    browserSpy.executeScript.and.resolveTo([JSON.stringify(samlResData1)]);
    browserSpy.close.and.returnValue(null);
    spyOn(component, 'checkSAMLResponseAndSignInUser');
    inAppBrowserService.create.and.returnValue(browserSpy);

    component.handleSamlSignIn({
      idp_url: 'url',
    });
    tick(1000);

    expect(inAppBrowserService.create).toHaveBeenCalledOnceWith('url' + '&RelayState=MOBILE', '_blank', 'location=yes');
    expect(component.checkSAMLResponseAndSignInUser).toHaveBeenCalledOnceWith(samlResData1);
  }));

  describe('checkSAMLResponseAndSignInUser():', () => {
    it('should check saml response and sign in user', async () => {
      routerAuthService.handleSignInResponse.and.resolveTo(authResData1);
      spyOn(component, 'trackLoginInfo');
      router.navigate.and.resolveTo(true);
      authService.refreshEou.and.returnValue(of(apiEouRes));

      component.fg.controls.email.setValue('ajain@fyle.in');
      fixture.detectChanges();

      await component.checkSAMLResponseAndSignInUser(samlResData1);

      expect(routerAuthService.handleSignInResponse).toHaveBeenCalledOnceWith(samlResData1);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    });

    it('should show error if saml response has an error', () => {
      spyOn(component, 'handleError');

      component.checkSAMLResponseAndSignInUser(samlResData2);
      expect(component.handleError).toHaveBeenCalledOnceWith({ status: 500 } as HttpErrorResponse);
    });
  });

  it('ionViewWillEnter(): should set up back button actions', () => {
    const mockSubscription = new Subscription();
    platformHandlerService.registerBackButtonAction.and.returnValue(mockSubscription);
    spyOn(component, 'goBack');
    component.ionViewWillEnter();
    expect(component.hardwareBackButtonAction).toEqual(mockSubscription);
    expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledTimes(1);
  });

  describe('goBack(): ', () => {
    it('should navigate to ENTER_EMAIL when current step is ENTER_PASSWORD', () => {
      spyOn(component, 'changeState');

      component.currentStep = SignInPageState.ENTER_PASSWORD;
      component.goBack(component.currentStep);

      expect(component.changeState).toHaveBeenCalledWith(SignInPageState.ENTER_EMAIL);
      expect(backButtonService.showAppCloseAlert).not.toHaveBeenCalled();
    });

    it('should show app close alert for other states', () => {
      spyOn(component, 'changeState');

      component.currentStep = SignInPageState.SELECT_SIGN_IN_METHOD;
      component.goBack(component.currentStep);

      expect(backButtonService.showAppCloseAlert).toHaveBeenCalledTimes(1);
      expect(component.changeState).not.toHaveBeenCalled();
    });

    it('should show app close alert for other states', () => {
      spyOn(component, 'changeState');

      component.currentStep = SignInPageState.ENTER_EMAIL;
      component.goBack(component.currentStep);

      expect(component.changeState).toHaveBeenCalledWith(SignInPageState.SELECT_SIGN_IN_METHOD);
    });
  });

  it('ionViewWillLeave(): should unsubscribe from hardwareBackButtonAction', () => {
    component.hardwareBackButtonAction = new Subscription();
    spyOn(component.hardwareBackButtonAction, 'unsubscribe');
    component.ionViewWillLeave();

    expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalled();
  });

  it('changeState(): should update the current step', () => {
    component.changeState(SignInPageState.ENTER_EMAIL);

    expect(component.currentStep).toBe(SignInPageState.ENTER_EMAIL);

    component.changeState(SignInPageState.ENTER_PASSWORD);

    expect(component.currentStep).toBe(SignInPageState.ENTER_PASSWORD);
  });

  it('goToForgotPasswordPage(): should navigate to the reset password page with the email parameter', () => {
    component.goToForgotPasswordPage();

    expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'reset_password', { email: 'ajain@fyle.in' }]);
  });

  describe('checkIfEmailExists(): ', () => {
    it('should check if value email exists', (done) => {
      component.fg.controls.email.setValue('email@gmail.com');
      spyOn(component, 'handleSamlSignIn');

      routerAuthService.checkEmailExists.and.returnValue(
        of({
          saml: true,
        })
      );
      fixture.detectChanges();

      component.checkIfEmailExists();
      expect(component.handleSamlSignIn).toHaveBeenCalledOnceWith({ saml: true });
      expect(routerAuthService.checkEmailExists).toHaveBeenCalledOnceWith(component.fg.controls.email.value);
      expect(component.emailLoading).toBeFalse();
      done();
    });

    it('set email and perform sign in if saml is disabled', (done) => {
      component.fg.controls.email.setValue('email@gmail.com');
      spyOn(component, 'handleSamlSignIn');

      routerAuthService.checkEmailExists.and.returnValue(of({}));
      fixture.detectChanges();

      component.checkIfEmailExists();
      expect(component.handleSamlSignIn).not.toHaveBeenCalled();
      done();
    });

    it('should throw error if email does not exist', () => {
      component.fg.controls.email.setValue('email@gmail.com');
      routerAuthService.checkEmailExists.and.returnValue(throwError(() => new HttpErrorResponse({ error: 'error' })));
      spyOn(component, 'handleError');

      component.checkIfEmailExists();

      expect(component.handleError).toHaveBeenCalledTimes(2);
      expect(component.handleError).toHaveBeenCalledWith(new HttpErrorResponse({ error: 'error' }));
    });

    it('should mark form as touched if email field is not valid', () => {
      component.currentStep = SignInPageState.ENTER_EMAIL;
      component.fg.controls.email.setValue('email.com'); // setting an invalid email

      component.checkIfEmailExists();
      fixture.detectChanges();
      const emailError = fixture.debugElement.query(By.css('.sign-in__enter-email__error-message'));
      expect(emailError).toBeDefined();
      expect(getTextContent(emailError.nativeElement)).toEqual('Please enter a valid email.');
    });
  });

  describe('handleError():', () => {
    it('should handle error and create a popover when the error is 500', async () => {
      const errorPopoverSpy = jasmine.createSpyObj('errorPopover', ['present']);
      popoverController.create.and.returnValue(errorPopoverSpy);

      const header = 'Sorry... Something went wrong!';
      const error = { status: 500 } as HttpErrorResponse;

      await component.handleError(error);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: ErrorComponent,
        componentProps: {
          header,
          error,
        },
        cssClass: 'dialog-popover',
      });
    });

    it('should handle error and create a popover when the error is 433', async () => {
      const errorPopoverSpy = jasmine.createSpyObj('errorPopover', ['present']);
      popoverController.create.and.returnValue(errorPopoverSpy);

      const header = 'Temporary Lockout';
      const error = { status: 433 } as HttpErrorResponse;

      await component.handleError(error);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: ErrorComponent,
        componentProps: {
          header,
          error,
        },
        cssClass: 'dialog-popover',
      });
    });

    it('should show default header if error status code not present', async () => {
      const errorPopoverSpy = jasmine.createSpyObj('errorPopover', ['present']);
      popoverController.create.and.returnValue(errorPopoverSpy);

      const header = 'Incorrect email or password';

      await component.handleError(null);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: ErrorComponent,
        componentProps: {
          header,
          error: null,
        },
        cssClass: 'dialog-popover',
      });
    });

    it('should navigate to pending verification if error status is 400', async () => {
      const errorPopoverSpy = jasmine.createSpyObj('errorPopover', ['present']);
      popoverController.create.and.returnValue(errorPopoverSpy);

      const error = { status: 400 } as HttpErrorResponse;

      await component.handleError(error);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'auth',
        'pending_verification',
        { email: component.fg.controls.email.value },
      ]);
    });

    it('should navigate to disabled page if error status is 422', async () => {
      const errorPopoverSpy = jasmine.createSpyObj('errorPopover', ['present']);
      popoverController.create.and.returnValue(errorPopoverSpy);

      const error = { status: 422 } as HttpErrorResponse;

      await component.handleError(error);

      expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'disabled']);
    });
  });

  describe('signInUser(): ', () => {
    it('should sign in user', async () => {
      spyOn(component, 'trackLoginInfo');
      routerAuthService.basicSignin.and.returnValue(of(authResData1));
      authService.refreshEou.and.returnValue(of(apiEouRes));
      trackingService.onSignin.and.callThrough();
      router.navigate.and.resolveTo(true);
      component.fg.controls.password.setValue('password');
      component.fg.controls.email.setValue('email');
      fixture.detectChanges();

      await component.signInUser();

      expect(routerAuthService.basicSignin).toHaveBeenCalledOnceWith('email', 'password');
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(trackingService.onSignin).toHaveBeenCalledOnceWith(apiEouRes.us.id);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    });

    it('show error if sign in fails', async () => {
      component.fg.controls.password.setValue('password');
      component.fg.controls.email.setValue('email');
      routerAuthService.basicSignin.and.returnValue(throwError(() => new HttpErrorResponse({ error: 'error' })));
      authService.refreshEou.and.returnValue(of(apiEouRes));
      trackingService.onSignin.and.callThrough();
      router.navigate.and.resolveTo(true);
      spyOn(component, 'handleError');
      fixture.detectChanges();

      await component.signInUser();

      expect(routerAuthService.basicSignin).toHaveBeenCalledOnceWith('email', 'password');
      expect(component.handleError).toHaveBeenCalledOnceWith(new HttpErrorResponse({ error: 'error' }));

      const errorPopup = fixture.debugElement.query(By.css('.dialog-popover'));
      expect(errorPopup).toBeDefined();
    });

    it('should show password field as marked', () => {
      spyOn(component.fg.controls.password, 'markAsTouched');
      fixture.detectChanges();

      component.signInUser();
      expect(component.fg.controls.password.markAsTouched).toHaveBeenCalledTimes(1);
    });
  });

  describe('googleSignIn():', () => {
    it('should sign in user with google', async () => {
      spyOn(component, 'trackLoginInfo');

      googleAuthService.login.and.resolveTo(authResData2);
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      routerAuthService.googleSignin.and.returnValue(of(authResData2));
      trackingService.onSignin.and.callThrough();
      router.navigate.and.resolveTo(true);
      authService.refreshEou.and.returnValue(of(apiEouRes));

      await component.googleSignIn();

      expect(googleAuthService.login).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledWith('Signing you in...', 10000);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.googleSignin).toHaveBeenCalledOnceWith(authResData2.accessToken);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(trackingService.onSignin).toHaveBeenCalledOnceWith(apiEouRes.us.id);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
      expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
    });
  });

  it('trackLoginInfo(): should track login', async () => {
    deviceService.getDeviceInfo.and.returnValue(of(extendedDeviceInfoMockData));
    trackingService.eventTrack.and.callThrough();
    loginInfoService.addLoginInfo.and.callThrough();

    await component.trackLoginInfo();
    expect(deviceService.getDeviceInfo).toHaveBeenCalledTimes(1);
    expect(trackingService.eventTrack).toHaveBeenCalledOnceWith('Added Login Info', {
      label: extendedDeviceInfoMockData.appVersion,
    });
  });

  describe('ngOnInit(): ', () => {
    it('should navigate to switch org page if logged in ', fakeAsync(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      routerAuthService.isLoggedIn.and.resolveTo(true);
      router.navigate.and.resolveTo(true);
      component.ngOnInit();
      tick(100);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(2);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.isLoggedIn).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: false }]);
    }));

    it('should set fg when email is not present in URl', fakeAsync(() => {
      activatedRoute.snapshot.params.email = null;
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      routerAuthService.isLoggedIn.and.resolveTo(true);
      router.navigate.and.resolveTo(true);
      component.ngOnInit();
      tick(1000);

      expect(component.fg.controls.email.value).toEqual('');
      expect(loaderService.showLoader).toHaveBeenCalledTimes(2);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.isLoggedIn).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: false }]);
    }));
  });

  it('should check if email exists on clicking the button', () => {
    component.currentStep = SignInPageState.ENTER_EMAIL;
    spyOn(component, 'checkIfEmailExists');
    fixture.detectChanges();

    const contButton = getElementBySelector(fixture, '#sign-in__continue') as HTMLElement;
    click(contButton);
    expect(component.checkIfEmailExists).toHaveBeenCalledTimes(1);
  });

  it('should sign in with google when clicking on the SIGN IN WITH GOOGLE button', () => {
    component.currentStep = SignInPageState.SELECT_SIGN_IN_METHOD;
    spyOn(component, 'googleSignIn');
    fixture.detectChanges();

    const googleButton = getElementBySelector(fixture, '.sign-in__secondary-cta__btn') as HTMLElement;
    click(googleButton);
    expect(component.googleSignIn).toHaveBeenCalledTimes(1);
  });

  it('should show error if email field is empty', () => {
    component.currentStep = SignInPageState.ENTER_EMAIL;
    component.fg.controls.email.setValue(null);
    component.fg.markAllAsTouched();
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.sign-in__enter-email__error-message'))).toEqual(
      'Please enter a valid email.'
    );
  });

  it('should show error if email is invalid', () => {
    component.currentStep = SignInPageState.ENTER_EMAIL;
    component.fg.controls.email.setValue('email.com');
    component.fg.markAllAsTouched();
    component.fg.controls.email.updateValueAndValidity();
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.sign-in__enter-email__error-message'))).toEqual(
      'Please enter a valid email.'
    );
  });

  describe('template: ', () => {
    it('should display the video container when currentStep is SELECT_SIGN_IN_METHOD', () => {
      component.currentStep = component.signInPageState.SELECT_SIGN_IN_METHOD;
      fixture.detectChanges();
      const videoElement = getElementBySelector(fixture, '.sign-in__video-container');
      expect(videoElement).toBeTruthy();
    });

    it('should display the email form when currentStep is ENTER_EMAIL', () => {
      component.currentStep = component.signInPageState.ENTER_EMAIL;
      fixture.detectChanges();
      const emailForm = getElementBySelector(fixture, '.sign-in__enter-email__form-container');
      expect(emailForm).toBeTruthy();
    });

    it('should disable the continue button if email is invalid', () => {
      component.currentStep = component.signInPageState.ENTER_EMAIL;
      component.fg.controls.email.setValue(null);
      fixture.detectChanges();
      const continueButton: HTMLButtonElement = getElementBySelector(
        fixture,
        '.sign-in__enter-email ion-button'
      ) as HTMLButtonElement;
      expect(continueButton.disabled).toBeTrue();
    });

    it('should display the password form when currentStep is ENTER_PASSWORD', () => {
      component.currentStep = component.signInPageState.ENTER_PASSWORD;
      fixture.detectChanges();
      const passwordForm = getElementBySelector(fixture, '.sign-in__enter-password__form-container');
      expect(passwordForm).toBeTruthy();
    });

    it('should toggle password visibility when icon is clicked', () => {
      component.currentStep = component.signInPageState.ENTER_PASSWORD;
      component.hidePassword = true;
      fixture.detectChanges();

      const toggleIcon = getElementBySelector(fixture, '.sign-in__enter-password__password-icon-container');
      toggleIcon.dispatchEvent(new Event('click'));
      fixture.detectChanges();

      expect(component.hidePassword).toBeFalse();
    });

    it('should call googleSignIn method when Google sign-in button is clicked', () => {
      spyOn(component, 'googleSignIn');
      component.currentStep = component.signInPageState.SELECT_SIGN_IN_METHOD;
      fixture.detectChanges();

      const googleSignInButton: HTMLButtonElement = getElementBySelector(
        fixture,
        '.sign-in__secondary-cta__btn'
      ) as HTMLButtonElement;
      googleSignInButton.click();

      expect(component.googleSignIn).toHaveBeenCalled();
    });
  });
});
