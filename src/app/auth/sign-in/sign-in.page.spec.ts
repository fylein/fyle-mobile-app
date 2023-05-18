import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PopoverController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { GoogleAuthService } from 'src/app/core/services/google-auth.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { PushNotificationService } from 'src/app/core/services/push-notification.service';
import { TrackingService } from '../../core/services/tracking.service';
import { DeviceService } from '../../core/services/device.service';
import { LoginInfoService } from '../../core/services/login-info.service';
import { SignInPage } from './sign-in.page';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { ErrorComponent } from './error/error.component';
import { authResData1, authResData2 } from 'src/app/core/mock-data/auth-reponse.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';

describe('SignInPage', () => {
  let component: SignInPage;
  let fixture: ComponentFixture<SignInPage>;
  let formBuilder: jasmine.SpyObj<FormBuilder>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let googleAuthService: jasmine.SpyObj<GoogleAuthService>;
  let inAppBrowser: jasmine.SpyObj<InAppBrowser>;
  let pushNotificationService: jasmine.SpyObj<PushNotificationService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let loginInfoService: jasmine.SpyObj<LoginInfoService>;
  let inAppBrowserService: jasmine.SpyObj<InAppBrowserService>;

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
    const pushNotificationServiceSpy = jasmine.createSpyObj('PushNotificationService', ['initPush']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['onSignin', 'eventTrack']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const loginInfoServiceSpy = jasmine.createSpyObj('LoginInfoService', ['addLoginInfo']);
    const inAppBrowserServiceSpy = jasmine.createSpyObj('InAppBrowserService', ['create']);

    TestBed.configureTestingModule({
      declarations: [SignInPage, MatButton],
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
      ],
      providers: [
        FormBuilder,
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
          provide: PushNotificationService,
          useValue: pushNotificationServiceSpy,
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
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SignInPage);
    component = fixture.componentInstance;

    formBuilder = TestBed.inject(FormBuilder) as jasmine.SpyObj<FormBuilder>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    googleAuthService = TestBed.inject(GoogleAuthService) as jasmine.SpyObj<GoogleAuthService>;
    inAppBrowser = TestBed.inject(InAppBrowser) as jasmine.SpyObj<InAppBrowser>;
    pushNotificationService = TestBed.inject(PushNotificationService) as jasmine.SpyObj<PushNotificationService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    loginInfoService = TestBed.inject(LoginInfoService) as jasmine.SpyObj<LoginInfoService>;
    inAppBrowserService = TestBed.inject(InAppBrowserService) as jasmine.SpyObj<InAppBrowserService>;

    loaderService.showLoader.and.returnValue(new Promise(() => {}));
    router.navigate.and.stub();
    routerAuthService.isLoggedIn.and.returnValue(Promise.resolve(false));

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
    browserSpy.executeScript.and.returnValue(Promise.resolve([JSON.stringify({ SAMLResponse: 'samlResponse' })]));
    browserSpy.close.and.returnValue(null);
    spyOn(component, 'checkSAMLResponseAndSignInUser');
    inAppBrowserService.create.and.returnValue(browserSpy);

    component.handleSamlSignIn({
      idp_url: 'url',
    });
    tick(1000);

    expect(inAppBrowserService.create).toHaveBeenCalledOnceWith('url' + '&RelayState=MOBILE', '_blank', 'location=yes');
    expect(component.checkSAMLResponseAndSignInUser).toHaveBeenCalledOnceWith({ SAMLResponse: 'samlResponse' });
  }));

  describe('checkSAMLResponseAndSignInUser():', () => {
    it('should check saml response and sign in user', async () => {
      routerAuthService.handleSignInResponse.and.returnValue(Promise.resolve(authResData1));
      spyOn(component, 'trackLoginInfo');
      pushNotificationService.initPush.and.callThrough();
      router.navigate.and.returnValue(Promise.resolve(true));
      authService.refreshEou.and.returnValue(of(apiEouRes));

      component.fg.controls.email.setValue('ajain@fyle.in');
      fixture.detectChanges();

      await component.checkSAMLResponseAndSignInUser({});

      expect(routerAuthService.handleSignInResponse).toHaveBeenCalledOnceWith({});
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
      expect(pushNotificationService.initPush).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    });

    it('should show error if saml response has an error', () => {
      spyOn(component, 'handleError');

      component.checkSAMLResponseAndSignInUser({ response_status_code: '500', error: 'error' });
      expect(component.handleError).toHaveBeenCalledOnceWith({ status: 500 });
    });
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
      expect(component.emailSet).toBeFalse();
      expect(component.emailLoading).toBeFalse();
      done();
    });

    it('set email and perform sign in if saml is disabled', (done) => {
      component.fg.controls.email.setValue('email@gmail.com');
      spyOn(component, 'handleSamlSignIn');

      routerAuthService.checkEmailExists.and.returnValue(of({}));
      fixture.detectChanges();

      component.checkIfEmailExists();
      expect(component.emailSet).toBeTrue();
      expect(component.handleSamlSignIn).not.toHaveBeenCalled();
      done();
    });

    it('should throw error if email does not exist', () => {
      component.fg.controls.email.setValue('email@gmail.com');
      routerAuthService.checkEmailExists.and.returnValue(throwError(() => new Error('error')));
      spyOn(component, 'handleError');

      component.checkIfEmailExists();

      expect(component.handleError).toHaveBeenCalledTimes(2);
      expect(component.handleError).toHaveBeenCalledWith(new Error('error'));
    });

    it('should mark form as touched if email field is not valid', () => {
      component.fg.controls.email.setErrors(new Error('error'));

      component.checkIfEmailExists();
      fixture.detectChanges();
      const emailError = fixture.debugElement.query(By.css('.sign-in--error'));
      expect(emailError).toBeDefined();
      expect(getTextContent(emailError.nativeElement)).toEqual('Please enter a valid email.');
    });
  });

  describe('handleError():', () => {
    it('should handle error and create a popover when the error is 500', async () => {
      const errorPopoverSpy = jasmine.createSpyObj('errorPopover', ['present']);
      popoverController.create.and.returnValue(errorPopoverSpy);

      const header = 'Sorry... Something went wrong!';
      const error = { status: 500 };

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
      const error = { status: 433 };

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

      const header = 'Incorrect Email or Password';

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

      const error = { status: 400 };

      await component.handleError(error);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'auth',
        'pending_verification',
        { email: component.fg.controls.email.value },
      ]);
    });
  });

  describe('signInUser(): ', () => {
    it('should sign in user', async () => {
      spyOn(component, 'trackLoginInfo');
      routerAuthService.basicSignin.and.returnValue(of(authResData1));
      authService.refreshEou.and.returnValue(of(apiEouRes));
      trackingService.onSignin.and.callThrough();
      pushNotificationService.initPush.and.callThrough();
      router.navigate.and.returnValue(Promise.resolve(true));
      component.fg.controls.password.setValue('password');
      component.fg.controls.email.setValue('email');
      fixture.detectChanges();

      await component.signInUser();

      expect(routerAuthService.basicSignin).toHaveBeenCalledOnceWith('email', 'password');
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(trackingService.onSignin).toHaveBeenCalledOnceWith('email', {
        label: 'Email',
      });
      expect(pushNotificationService.initPush).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    });

    it('show error if sign in fails', async () => {
      component.fg.controls.password.setValue('password');
      component.fg.controls.email.setValue('email');
      routerAuthService.basicSignin.and.returnValue(throwError(() => new Error('error')));
      authService.refreshEou.and.returnValue(of(apiEouRes));
      trackingService.onSignin.and.callThrough();
      pushNotificationService.initPush.and.callThrough();
      router.navigate.and.returnValue(Promise.resolve(true));
      spyOn(component, 'handleError');
      fixture.detectChanges();

      await component.signInUser();

      expect(routerAuthService.basicSignin).toHaveBeenCalledOnceWith('email', 'password');
      expect(component.handleError).toHaveBeenCalledOnceWith(new Error('error'));

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

      googleAuthService.login.and.returnValue(Promise.resolve(authResData2));
      loaderService.showLoader.and.returnValue(Promise.resolve());
      loaderService.hideLoader.and.returnValue(Promise.resolve());
      routerAuthService.googleSignin.and.returnValue(of(authResData2));
      trackingService.onSignin.and.callThrough();
      pushNotificationService.initPush.and.callThrough();
      router.navigate.and.returnValue(Promise.resolve(true));
      authService.refreshEou.and.returnValue(of(apiEouRes));

      await component.googleSignIn();

      expect(googleAuthService.login).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledWith('Signing you in...', 10000);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.googleSignin).toHaveBeenCalledOnceWith(authResData2.accessToken);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(trackingService.onSignin).toHaveBeenCalledOnceWith('ajain@fyle.in', {
        label: 'Email',
      });
      expect(pushNotificationService.initPush).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
      expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if google reponse doesn't contain access token", async () => {
      googleAuthService.login.and.returnValue(Promise.resolve(authResData1));
      spyOn(component, 'handleError');

      await component.googleSignIn();
      expect(googleAuthService.login).toHaveBeenCalledTimes(1);
      expect(component.handleError).toHaveBeenCalledOnceWith(undefined);
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

  it('ionViewWillEnter(): should set email', () => {
    expect(component.emailSet).toEqual(false);

    component.fg.controls.email.setValue('email');

    component.ionViewWillEnter();
    expect(component.emailSet).toEqual(true);
  });

  describe('ngOnInit(): ', () => {
    it('should navigate to switch org page if logged in ', fakeAsync(() => {
      loaderService.showLoader.and.returnValue(Promise.resolve());
      loaderService.hideLoader.and.returnValue(Promise.resolve());
      routerAuthService.isLoggedIn.and.returnValue(Promise.resolve(true));
      router.navigate.and.returnValue(Promise.resolve(true));
      component.ngOnInit();
      tick(100);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(2);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.isLoggedIn).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: false }]);
    }));

    it('should set fg when email is not present in URl', fakeAsync(() => {
      activatedRoute.snapshot.params.email = null;
      loaderService.showLoader.and.returnValue(Promise.resolve());
      loaderService.hideLoader.and.returnValue(Promise.resolve());
      routerAuthService.isLoggedIn.and.returnValue(Promise.resolve(true));
      router.navigate.and.returnValue(Promise.resolve(true));
      component.ngOnInit();
      tick(1000);

      expect(component.fg.controls.email.value).toEqual('');
      expect(loaderService.showLoader).toHaveBeenCalledTimes(2);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(routerAuthService.isLoggedIn).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: false }]);
    }));
  });

  it('should check if email exists on typing the input', () => {
    spyOn(component, 'checkIfEmailExists');
    component.emailSet = false;
    component.fg.controls.email.setValue('ajain@fyle.in');
    fixture.detectChanges();

    const emailField = getElementBySelector(fixture, '#sign-in--email');
    emailField.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(component.checkIfEmailExists).toHaveBeenCalledTimes(1);
  });

  it('should check if email exists on clicking the button', () => {
    spyOn(component, 'checkIfEmailExists');

    const contButton = getElementBySelector(fixture, '#sign-in--continue') as HTMLElement;
    click(contButton);
    expect(component.checkIfEmailExists).toHaveBeenCalledTimes(1);
  });

  it('should sign in with google when clicking on the SIGN IN WITH GOOGLE button', () => {
    spyOn(component, 'googleSignIn');
    const googleButton = getElementBySelector(fixture, '.sign-in--secondary-cta-btn') as HTMLElement;

    click(googleButton);
    expect(component.googleSignIn).toHaveBeenCalledTimes(1);
  });

  it('should show error if email field is empty', () => {
    component.fg.controls.email.setValue(null);
    component.fg.markAllAsTouched();
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.sign-in--error'))).toEqual('Please enter an email.');
  });

  it('should show error if email is invalid', () => {
    component.fg.controls.email.setValue('email.com');
    component.fg.markAllAsTouched();
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.sign-in--error'))).toEqual('Please enter a valid email.');
  });
});
