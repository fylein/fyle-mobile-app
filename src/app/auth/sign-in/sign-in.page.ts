import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { from, throwError, Observable, of, noop, Subscription } from 'rxjs';
import { PopoverController, IonicModule } from '@ionic/angular';
import { ErrorComponent } from './error/error.component';
import { shareReplay, filter, finalize, switchMap, map, tap, take } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GoogleAuthService } from 'src/app/core/services/google-auth.service';
import { TrackingService } from '../../core/services/tracking.service';
import { DeviceService } from '../../core/services/device.service';
import { LoginInfoService } from '../../core/services/login-info.service';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EmailExistsResponse } from 'src/app/core/models/email-exists-response.model';
import { SamlResponse } from 'src/app/core/models/saml-response.model';
import { SignInPageState } from './sign-in-page-state.enum';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { BackButtonService } from 'src/app/core/services/back-button.service';
import { FormButtonValidationDirective } from '../../shared/directive/form-button-validation.directive';
import { MatInput, MatSuffix } from '@angular/material/input';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.page.html',
    styleUrls: ['./sign-in.page.scss'],
    imports: [
        IonicModule,
        FormButtonValidationDirective,
        FormsModule,
        ReactiveFormsModule,
        MatInput,
        NgClass,
        MatSuffix,
    ],
})
export class SignInPage implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  private routerAuthService = inject(RouterAuthService);

  private popoverController = inject(PopoverController);

  private loaderService = inject(LoaderService);

  private authService = inject(AuthService);

  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);

  googleAuthService = inject(GoogleAuthService);

  private trackingService = inject(TrackingService);

  private deviceService = inject(DeviceService);

  private loginInfoService = inject(LoginInfoService);

  private inAppBrowserService = inject(InAppBrowserService);

  private platformHandlerService = inject(PlatformHandlerService);

  private backButtonService = inject(BackButtonService);

  fg: UntypedFormGroup;

  emailLoading = false;

  passwordLoading = false;

  googleSignInLoading = false;

  hidePassword = true;

  checkEmailExists$: Observable<EmailExistsResponse>;

  currentStep: SignInPageState;

  signInPageState: typeof SignInPageState = SignInPageState;

  hardwareBackButtonAction: Subscription;

  focusOnPassword = false;

  async checkSAMLResponseAndSignInUser(data: SamlResponse): Promise<void> {
    if (data && data.error) {
      const err = {
        status: parseInt(data.response_status_code, 10),
      } as HttpErrorResponse;

      this.handleError(err);
    } else {
      // Login Success
      const markOptions: PerformanceMarkOptions = {
        detail: 'SAML Login',
      };
      performance.mark('login start time', markOptions);
      from(this.routerAuthService.handleSignInResponse(data))
        .pipe(
          take(1),
          switchMap(() => this.authService.refreshEou()),
          tap(async (eou) => {
            await this.trackLoginInfo();
            this.trackingService.onSignin(eou.us.id);
          }),
        )
        .subscribe(() => {
          this.fg.reset();
          this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
        });
    }
  }

  handleSamlSignIn(res: EmailExistsResponse): void {
    const url = res.idp_url + '&RelayState=MOBILE';
    const browser = this.inAppBrowserService.create(url, '_blank', 'location=yes');
    browser
      .on('loadstop')
      .pipe(take(1))
      .subscribe(() => {
        const getResponse = setInterval(() => {
          browser
            .executeScript({
              code: 'try{document.getElementById("fyle-login-response").innerHTML;}catch(err){}',
            })
            .then(async (responseData: string[]) => {
              const response = responseData && responseData[0];
              let data: SamlResponse;

              try {
                data = JSON.parse(response) as SamlResponse;
              } catch (err) {}

              if (data) {
                clearInterval(getResponse);
                browser.close();
                await this.checkSAMLResponseAndSignInUser(data);
              }
            });
        }, 1000);
      });
  }

  async checkIfEmailExists(): Promise<void> {
    if (this.fg.controls.email.valid) {
      this.emailLoading = true;

      const checkEmailExists$ = this.routerAuthService.checkEmailExists(this.fg.controls.email.value as string).pipe(
        shareReplay(1),
        finalize(async () => {
          this.emailLoading = false;
        }),
      );

      const saml$ = checkEmailExists$.pipe(filter((res) => (res.saml ? true : false)));

      const basicSignIn$ = checkEmailExists$.pipe(filter((res) => (!res.saml ? true : false)));

      basicSignIn$.subscribe({
        next: () => (this.currentStep = this.signInPageState.ENTER_PASSWORD),
        error: (err: HttpErrorResponse) => this.handleError(err),
      });

      saml$.subscribe({
        next: (res) => this.handleSamlSignIn(res),
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
    } else {
      this.fg.controls.email.markAsTouched();
    }
  }

  goToForgotPasswordPage(): void {
    this.trackingService.eventTrack('Go to Forgot Password page');
    this.router.navigate(['/', 'auth', 'reset_password', { email: this.fg.controls.email.value as string }]);
  }

  async handleError(error: HttpErrorResponse): Promise<void> {
    let header = 'Incorrect email or password';

    switch (error?.status) {
      case 400:
        this.trackingService.eventTrack('Go to Invite Expired page');
        this.router.navigate(['/', 'auth', 'pending_verification', { email: this.fg.controls.email.value as string }]);
        break;

      case 406:
        this.trackingService.eventTrack('Go to Password Expired page');
        const queryParams: Record<string, boolean> = {
          tmp_pwd_expired: true,
        };
        this.router.navigate(['/', 'auth', 'reset_password', { email: this.fg.controls.email.value as string }], {
          queryParams,
        });
        break;

      case 422:
        this.trackingService.eventTrack('Go to Disabled User page');
        this.router.navigate(['/', 'auth', 'disabled']);
        break;

      case 500:
        header = 'Sorry... Something went wrong!';
        break;

      case 433:
        header = 'Temporary Lockout';
        break;

      default:
        break;
    }

    const errorPopover = await this.popoverController.create({
      component: ErrorComponent,
      componentProps: {
        header,
        error,
      },
      cssClass: 'dialog-popover',
    });

    this.emailLoading = false;
    this.passwordLoading = false;
    await errorPopover.present();
  }

  signInUser(): void {
    if (this.fg.controls.password.valid) {
      this.emailLoading = false;
      this.passwordLoading = true;
      const markOptions: PerformanceMarkOptions = {
        detail: 'Password Login',
      };
      performance.mark('login start time', markOptions);
      this.routerAuthService
        .basicSignin(this.fg.controls.email.value as string, this.fg.controls.password.value as string)
        .pipe(
          switchMap(() => this.authService.refreshEou()),
          tap(async (eou) => {
            this.trackingService.onSignin(eou.us.id);
            await this.trackLoginInfo();
          }),
          finalize(() => (this.passwordLoading = false)),
        )
        .subscribe({
          next: () => {
            this.fg.reset();
            this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
          },
          error: (err: HttpErrorResponse) => this.handleError(err),
        });
    } else {
      this.fg.controls.password.markAsTouched();
    }
  }

  googleSignIn(): void {
    this.googleSignInLoading = true;
    const markOptions: PerformanceMarkOptions = {
      detail: 'Google Login',
    };
    performance.mark('login start time', markOptions);
    from(this.googleAuthService.login())
      .pipe(
        switchMap((googleAuthResponse: { accessToken: string }) => {
          if (googleAuthResponse.accessToken) {
            return of(googleAuthResponse);
          } else {
            return throwError(noop);
          }
        }),
        map((googleAuthResponse) => {
          from(this.loaderService.showLoader('Signing you in...', 10000));
          return googleAuthResponse;
        }),
        switchMap((googleAuthResponse) =>
          this.routerAuthService.googleSignin(googleAuthResponse.accessToken).pipe(
            switchMap(() => this.authService.refreshEou()),
            tap(async (eou) => {
              this.trackingService.onSignin(eou.us.id);
              await this.trackLoginInfo();
            }),
          ),
        ),
        finalize(() => {
          this.loaderService.hideLoader();
          this.googleSignInLoading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.fg.reset();
          this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  async trackLoginInfo(): Promise<void> {
    const deviceInfo = await this.deviceService.getDeviceInfo().toPromise();
    this.trackingService.eventTrack('Added Login Info', { label: deviceInfo.appVersion });
    await this.loginInfoService.addLoginInfo(deviceInfo.appVersion, new Date());
  }

  goBack(currentStep: SignInPageState): void {
    switch (currentStep) {
      case SignInPageState.ENTER_EMAIL:
        this.changeState(SignInPageState.SELECT_SIGN_IN_METHOD);
        break;
      case SignInPageState.ENTER_PASSWORD:
        this.changeState(SignInPageState.ENTER_EMAIL);
        break;
      default:
        this.backButtonService.showAppCloseAlert();
    }
  }

  ionViewWillEnter(): void {
    if (this.activatedRoute.snapshot.params.email) {
      this.currentStep = SignInPageState.ENTER_PASSWORD;
      this.trackingService.eventTrack('Sign In page opened - enter password state');
    } else {
      this.currentStep = SignInPageState.SELECT_SIGN_IN_METHOD;
      this.trackingService.eventTrack('Sign In page opened - select sign in state');
    }
    const fn = (): void => {
      this.goBack(this.currentStep);
    };
    const priority = BackButtonActionPriority.MEDIUM;
    this.hardwareBackButtonAction = this.platformHandlerService.registerBackButtonAction(priority, fn);
  }

  changeState(state: SignInPageState): void {
    this.trackingService.eventTrack('Sign in page navigation', { state });
    this.currentStep = state;
  }

  ngOnInit(): void {
    const presentEmail = this.activatedRoute.snapshot.params.email as string;
    this.fg = this.formBuilder.group({
      email: [presentEmail || '', Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
      password: ['', Validators.required],
    });

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => from(this.routerAuthService.isLoggedIn())),
        finalize(() => from(this.loaderService.hideLoader())),
      )
      .subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.router.navigate(['/', 'auth', 'switch_org', { choose: false }]);
        }
      });
  }

  ionViewWillLeave(): void {
    this.hardwareBackButtonAction.unsubscribe();
  }
}
