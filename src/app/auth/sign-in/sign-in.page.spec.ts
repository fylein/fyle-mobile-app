import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { extendedDeviceInfoMockData } from 'src/app/core/mock-data/extended-device-info.data';
import { ErrorComponent } from './error/error.component';
import { authResData1, authResData2 } from 'src/app/core/mock-data/auth-reponse.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { MatButtonModule } from '@angular/material/button';

fdescribe('SignInPage', () => {
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

    TestBed.configureTestingModule({
      declarations: [SignInPage],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatButtonModule,
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
      ],
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

    loaderService.showLoader.and.returnValue(Promise.resolve());
    router.navigate.and.stub();
    routerAuthService.isLoggedIn.and.returnValue(Promise.resolve(false));

    const presentEmail = activatedRoute.snapshot.params.email;

    component.fg = formBuilder.group({
      email: [],
      password: ['', Validators.required],
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('checkSAMLResponseAndSignInUser(): should check saml response and sign in user', async () => {
    routerAuthService.handleSignInResponse.and.returnValue(Promise.resolve(authResData1));
    spyOn(component, 'trackLoginInfo');
    trackingService.onSignin.and.callThrough();
    pushNotificationService.initPush.and.callThrough();
    router.navigate.and.returnValue(Promise.resolve(true));
    authService.refreshEou.and.returnValue(of(apiEouRes));

    component.fg.controls.email.setValue('ajain@fyle.in');
    fixture.detectChanges();

    await component.checkSAMLResponseAndSignInUser({});

    expect(pushNotificationService.initPush).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
    expect(authService.refreshEou).toHaveBeenCalledTimes(1);
    expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
    expect(routerAuthService.handleSignInResponse).toHaveBeenCalledOnceWith({});
  });

  it('checkIfEmailExists(): should check if value email exists', async () => {
    component.fg.controls.email.setErrors(null);

    routerAuthService.checkEmailExists.and.returnValue(
      of({
        smal: 'Response',
      })
    );
    fixture.detectChanges();
    spyOn(component, 'handleSamlSignIn').and.callThrough();

    await component.checkIfEmailExists();
  });

  describe('handleError():', () => {
    it('should handle error and create a popover when the error is 500', async () => {
      const errorPopoverSpy = jasmine.createSpyObj('errorPopover', ['present']);
      errorPopoverSpy.present.and.returnValue(Promise.resolve(true));
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
  });

  it('signInUser(): should sign in user', async () => {
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

  it('googleSignIn(): should sign in user with google', async () => {
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
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(2);
    expect(routerAuthService.googleSignin).toHaveBeenCalledOnceWith(authResData2.accessToken);
    expect(authService.refreshEou).toHaveBeenCalledTimes(1);
    expect(trackingService.onSignin).toHaveBeenCalledOnceWith('ajain@fyle.in', {
      label: 'Email',
    });
    expect(pushNotificationService.initPush).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    expect(component.trackLoginInfo).toHaveBeenCalledTimes(1);
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
});
