import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { from, throwError, Observable, of, noop } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { ErrorComponent } from './error/error.component';
import { shareReplay, filter, finalize, switchMap, map, tap, take } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GoogleAuthService } from 'src/app/core/services/google-auth.service';
import { PushNotificationService } from 'src/app/core/services/push-notification.service';
import { TrackingService } from '../../core/services/tracking.service';
import { DeviceService } from '../../core/services/device.service';
import { LoginInfoService } from '../../core/services/login-info.service';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EmailExistsResponse } from 'src/app/core/models/email-exists-response.model';
import { SamlResponse } from 'src/app/core/models/saml-response.model';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  fg: FormGroup;

  emailSet = false;

  emailLoading = false;

  passwordLoading = false;

  googleSignInLoading = false;

  hide = true;

  checkEmailExists$: Observable<EmailExistsResponse>;

  constructor(
    private formBuilder: FormBuilder,
    private routerAuthService: RouterAuthService,
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public googleAuthService: GoogleAuthService,
    private pushNotificationService: PushNotificationService,
    private trackingService: TrackingService,
    private deviceService: DeviceService,
    private loginInfoService: LoginInfoService,
    private inAppBrowserService: InAppBrowserService,
  ) {}

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
          tap(async () => {
            await this.trackLoginInfo();
            this.trackingService.onSignin(this.fg.controls.email.value as string, {
              label: 'Email',
            });
          }),
        )
        .subscribe(() => {
          this.pushNotificationService.initPush();
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
      ) as Observable<EmailExistsResponse>;

      const saml$ = checkEmailExists$.pipe(filter((res) => (res.saml ? true : false)));

      const basicSignIn$ = checkEmailExists$.pipe(filter((res) => (!res.saml ? true : false)));

      basicSignIn$.subscribe({
        next: () => (this.emailSet = true),
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

  async handleError(error: HttpErrorResponse): Promise<void> {
    let header = 'Incorrect Email or Password';

    if (error?.status === 400) {
      this.router.navigate(['/', 'auth', 'pending_verification', { email: this.fg.controls.email.value as string }]);
      return;
    } else if (error?.status === 422) {
      this.router.navigate(['/', 'auth', 'disabled']);
      return;
    } else if (error?.status === 500) {
      header = 'Sorry... Something went wrong!';
    } else if (error?.status === 433) {
      header = 'Temporary Lockout';
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
          tap(async () => {
            this.trackingService.onSignin(this.fg.controls.email.value as string, {
              label: 'Email',
            });
            await this.trackLoginInfo();
          }),
          finalize(() => (this.passwordLoading = false)),
        )
        .subscribe({
          next: () => {
            this.pushNotificationService.initPush();
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
        switchMap((googleAuthResponse: any) => {
          if (googleAuthResponse && googleAuthResponse.authentication && googleAuthResponse.authentication.idToken) {
            return of(googleAuthResponse.authentication.idToken);
          } else {
            return throwError(noop);
          }
        }),
        map((idToken: string) => {
          from(this.loaderService.showLoader('Signing you in...', 10000));
          return idToken;
        }),
        switchMap((idToken: string) =>
          this.routerAuthService.googleSignin(idToken).pipe(
            switchMap(() => this.authService.refreshEou()),
            tap(async () => {
              this.trackingService.onSignin(this.fg.controls.email.value as string, {
                label: 'Email',
              });
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
          this.pushNotificationService.initPush();
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

  ionViewWillEnter(): void {
    this.emailSet = !!this.fg.controls.email.value;
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
}
