import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { throwError } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { ErrorComponent } from './error/error.component';
import { shareReplay, catchError, filter, finalize, tap, switchMap } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }

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

    saml$.subscribe(() => {
      console.log('Not handled');
    });
  }

  async handleError(err) {
    let header = 'Incorrect Email or Password';

    if (err.status === 400) {
      header = 'Account Not Verified!';
    } else if (err.status === 401) {
      header = 'Unauthorized';

      if (err.data && err.data.message) {
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
      cssClass: 'error-popover'
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
      this.router.navigate(['/', 'auth', 'switch-org']);
    });
  }

  async ngOnInit() {
    this.fg = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')])],
      password: ['', Validators.required]
    });

    const isLoggedIn = await this.routerAuthService.isLoggedIn();

    if (isLoggedIn) {
      this.router.navigate(['/', 'auth', 'switch-org']);
    }
  }
}
