import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { throwError } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { ErrorComponent } from './error/error.component';
import { shareReplay, catchError, filter, finalize, tap, switchMap } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { GoogleAuthService } from 'src/app/core/services/google-auth.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  fg: FormGroup;
  emailSet = false;

  constructor(
    private formBuilder: FormBuilder,
    private routerAuthService: RouterAuthService,
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public googleAuthService: GoogleAuthService,
    private inAppBrowser: InAppBrowser
  ) { }

  checkSAMLResponseAndSignInUser = function (data) {
    if (data.error) {
      let err = {
        status: parseInt(data.response_status_code)
      };

      this.handleError(err);
    } else {
      // Login Success
      this.routerAuthService.handleSignInResponse(data);
      const samlNewRefreshToken$ = this.authService.newRefreshToken(data.refresh_token);

      samlNewRefreshToken$.subscribe(() => {
        this.router.navigate(['/', 'auth', 'switch_org']);
      });
    }
  };

  handleSamlSignIn(res) {
    const url = res.idp_url + '&RelayState=MOBILE';
    const browser = this.inAppBrowser.create(url, '_blank', 'location=yes');
    browser.on('loadstop').subscribe(event => {
      const getResponse = setInterval(() => {
        browser.executeScript({
          code: 'try{document.getElementById("fyle-login-response").innerHTML;}catch(err){}'
        }).then((responseData) => {
          const response = responseData && responseData[0];
          let data = '';

          try {
            data = JSON.parse(response);
          } catch (err) {
          }
          if (data) {
            clearInterval(getResponse);
            browser.close();
            this.checkSAMLResponseAndSignInUser(data);
          }
        });
      }, 1000);
    });
  }

  async checkIfEmailExists() {
    await this.loaderService.showLoader();

    const checkEmailExists$ = this.routerAuthService
      .checkEmailExists(this.fg.controls.email.value)
      .pipe(
        catchError(err => {
          this.handleError(err);
          return throwError(err);
        }),
        shareReplay(),
        finalize(async () => {
          await this.loaderService.hideLoader();
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
  }

  async handleError(err: HttpErrorResponse) {
    let header = 'Incorrect Email or Password';

    if (err.status === 400) {
      header = 'Account Not Verified!';
    } else if (err.status === 401) {
      header = 'Unauthorized';

      if (err.error && err.error.message) {
        header = 'Account doesn\'t exist';
      }
    } else if (err.status === 500) {
      header = 'Something Bad Happened';
    } else if (err.status === 433) {
      header = 'Temporary Lockout';
    }

    const errorPopover = await this.popoverController.create({
      component: ErrorComponent,
      componentProps: {
        header
      },
      cssClass: 'dialog-popover'
    });

    await errorPopover.present();
  }

  async signInUser() {
    await this.loaderService.showLoader();

    const basicSignIn$ = this.routerAuthService.basicSignin(this.fg.value.email, this.fg.value.password).pipe(
      catchError(err => {
        this.handleError(err);
        return throwError(err);
      }),
      switchMap((res) => {
        return this.authService.newRefreshToken(res.refresh_token);
      }),
      finalize(async () => {
        await this.loaderService.hideLoader();
      })
    );

    basicSignIn$.subscribe(() => {
      this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
    });
  }

  googleSignIn() {
    this.googleAuthService.login().then(data => {
      const googleSignIn$ = this.routerAuthService.googleSignin(data.accessToken).pipe(
        catchError(err => {
          this.handleError(err);
          return throwError(err);
        }),
        switchMap((res) => {
          return this.authService.newRefreshToken(res.refresh_token);
        })
      );

      googleSignIn$.subscribe(() => {
        this.router.navigate(['/', 'auth', 'switch_org', { choose: true }]);
      });
    });
  }

  async ngOnInit() {
    const presentEmail = this.activatedRoute.snapshot.params.email;
    this.fg = this.formBuilder.group({
      email: [presentEmail || '', Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
      password: ['', Validators.required]
    });

    const isLoggedIn = await this.routerAuthService.isLoggedIn();

    if (isLoggedIn) {
      this.router.navigate(['/', 'auth', 'switch_org', { choose: false }]);
    }
  }
}
