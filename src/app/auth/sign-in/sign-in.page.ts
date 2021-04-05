import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RouterAuthService} from 'src/app/core/services/router-auth.service';
import {from, throwError, Observable, of} from 'rxjs';
import {PopoverController} from '@ionic/angular';
import {ErrorComponent} from './error/error.component';
import {shareReplay, catchError, filter, finalize, switchMap, map, concatMap, tap, take} from 'rxjs/operators';
import {LoaderService} from 'src/app/core/services/loader.service';
import {AuthService} from 'src/app/core/services/auth.service';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {GoogleAuthService} from 'src/app/core/services/google-auth.service';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {PushNotificationService} from 'src/app/core/services/push-notification.service';
import {TrackingService} from '../../core/services/tracking.service';
import {AppVersionService} from '../../core/services/app-version.service';
import {DeviceService} from '../../core/services/device.service';
import {LoginInfoService} from '../../core/services/login-info.service';

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
  checkEmailExists$: Observable<any>;

  constructor(
    private formBuilder: FormBuilder,
    private routerAuthService: RouterAuthService,
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public googleAuthService: GoogleAuthService,
    private inAppBrowser: InAppBrowser,
    private pushNotificationService: PushNotificationService,
    private trackingService: TrackingService,
    private deviceService: DeviceService,
    private loginInfoService: LoginInfoService
  ) {
  }

  async checkSAMLResponseAndSignInUser(data) {
    if (data && data.error) {
      const err = {
        status: parseInt(data.response_status_code, 10)
      };

      this.handleError(err);
    } else {
      // Login Success
      await this.routerAuthService.handleSignInResponse(data);
      const samlNewRefreshToken$ = this.authService.newRefreshToken(data.refresh_token);

      samlNewRefreshToken$.pipe(
        tap(async () => {
          await this.trackLoginInfo();
          this.trackingService.onSignin(this.fg.value.email, {
            Asset: 'Mobile',
            label: 'Email'
          });
        })
      ).subscribe(() => {
        this.pushNotificationService.initPush();
        this.fg.reset();
        this.router.navigate(['/', 'auth', 'switch_org', {choose: true}]);
      });
    }
  }

  handleSamlSignIn(res) {
    const url = res.idp_url + '&RelayState=MOBILE';
    const browser = this.inAppBrowser.create(url, '_blank', 'location=yes');
    browser.on('loadstop').pipe(take(1)).subscribe(event => {
      const getResponse = setInterval(() => {
        browser.executeScript({
          code: 'try{document.getElementById("fyle-login-response").innerHTML;}catch(err){}'
        }).then(async (responseData) => {
          const response = responseData && responseData[0];
          let data = '';

          try {
            data = JSON.parse(response);
          } catch (err) {
          }
          if (data) {
            clearInterval(getResponse);
            browser.close();
            await this.checkSAMLResponseAndSignInUser(data);
          }
        });
      }, 1000);
    });
  }

  async checkIfEmailExists() {
    if (this.fg.controls.email.valid) {
      this.emailLoading = true;

      const checkEmailExists$ = this.routerAuthService
        .checkEmailExists(this.fg.controls.email.value)
        .pipe(
          catchError(err => {
            this.handleError(err);
            return throwError(err);
          }),
          shareReplay(1),
          finalize(async () => {
            this.emailLoading = false;
          })
        );

      const saml$ = checkEmailExists$.pipe(
        filter(res => res.saml ? true : false)
      );

      const basicSignIn$ = checkEmailExists$.pipe(
        filter(res => !res.saml ? true : false)
      );

      basicSignIn$.subscribe(() => {
        this.emailSet = true;
      });

      saml$.subscribe((res) => {
        this.handleSamlSignIn(res);
      });
    } else {
      this.fg.controls.email.markAsTouched();
    }
  }

  async handleError(error) {
    let header = 'Incorrect Email or Password';

    if (error.status === 400) {
      header = 'Account Not Verified!';
    } else if (error.status === 401) {
      header = 'Unauthorized';

      if (error.error && error.error.message) {
        header = 'Account doesn\'t exist';
      }
    } else if (error.status === 500) {
      header = 'Sorry... Something went wrong!';
    } else if (error.status === 433) {
      header = 'Temporary Lockout';
    }

    const errorPopover = await this.popoverController.create({
      component: ErrorComponent,
      componentProps: {
        header,
        error
      },
      cssClass: 'dialog-popover'
    });

    this.emailLoading = false;
    this.passwordLoading = false;
    await errorPopover.present();
  }

  signInUser() {
    if (this.fg.controls.password.valid) {
      this.emailLoading = false;
      this.passwordLoading = true;
      this.routerAuthService.basicSignin(this.fg.value.email, this.fg.value.password).pipe(
        catchError(err => {
          this.handleError(err);
          return throwError(err);
        }),
        switchMap((res) => {
          return this.authService.newRefreshToken(res.refresh_token);
        }),
        tap(async () => {
          await this.trackLoginInfo();
          this.trackingService.onSignin(this.fg.value.email, {
            Asset: 'Mobile',
            label: 'Email'
          });
        }),
        finalize(() => this.passwordLoading = false)
      ).subscribe(() => {
        this.pushNotificationService.initPush();
        this.fg.reset();
        this.router.navigate(['/', 'auth', 'switch_org', {choose: true}]);
      });
    } else {
      this.fg.controls.password.markAsTouched();
    }
  }

  googleSignIn() {
    this.googleSignInLoading = true;
    from(this.googleAuthService.login()).pipe(
      switchMap((googleAuthResponse) => {
        if (googleAuthResponse.accessToken) {
          return of(googleAuthResponse);
        } else {
          return throwError({});
        }
      }),
      map(googleAuthResponse => {
        from(this.loaderService.showLoader('Signing you in...', 10000));
        return googleAuthResponse;
      }),
      switchMap((googleAuthResponse) => {
        return this.routerAuthService.googleSignin(googleAuthResponse.accessToken).pipe(
          catchError(err => {
            this.handleError(err);
            return throwError(err);
          }),
          switchMap((res) => {
            return this.authService.newRefreshToken(res.refresh_token);
          }),
          tap(async () => {
            await this.trackLoginInfo();
            this.trackingService.onSignin(this.fg.value.email, {
              Asset: 'Mobile',
              label: 'Email'
            });
          })
        );
      }),
      finalize(() => {
        this.loaderService.hideLoader();
        this.googleSignInLoading = false;
      })
    ).subscribe(() => {
      this.pushNotificationService.initPush();
      this.fg.reset();
      this.router.navigate(['/', 'auth', 'switch_org', {choose: true}]);
    });
  }

  async trackLoginInfo() {
    const deviceInfo = await this.deviceService.getDeviceInfo().toPromise();
    this.trackingService.eventTrack('Added Login Info', {Asset: 'Mobile', label: deviceInfo.appVersion});
    await this.loginInfoService.addLoginInfo(deviceInfo.appVersion, new Date());
  }

  ionViewWillEnter() {
    this.emailSet = !!this.fg.value.email;
  }

  async ngOnInit() {
    const presentEmail = this.activatedRoute.snapshot.params.email;
    this.fg = this.formBuilder.group({
      email: [presentEmail || '', Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
      password: ['', Validators.required]
    });

    const isLoggedIn = await this.routerAuthService.isLoggedIn();

    if (isLoggedIn) {
      this.router.navigate(['/', 'auth', 'switch_org', {choose: false}]);
    }
  }
}
