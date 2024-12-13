import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PageState } from 'src/app/core/models/page-state.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage {
  currentPageState: PageState;

  isLoading = false;

  fg: FormGroup;

  resetEmail: string;

  isEmailSentOnce: boolean;

  PageState: typeof PageState = PageState;

  constructor(
    private formBuilder: FormBuilder,
    private routerAuthService: RouterAuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  ionViewWillEnter(): void {
    this.currentPageState = PageState.notSent;
    const email = (this.activatedRoute.snapshot.params.email as string) || '';
    this.fg = this.formBuilder.group({
      email: [email, Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
    });
  }

  sendResetLink(email: string): void {
    this.isLoading = true;
    this.resetEmail = email;

    if (this.currentPageState === PageState.success) {
      this.isEmailSentOnce = true;
    }

    this.routerAuthService
      .sendResetPassword(email)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.currentPageState = PageState.success;
          if (this.isEmailSentOnce) {
            const toastMessageData = {
              message: ' Password recovery email sent successfully.',
            };
            this.matSnackBar.openFromComponent(ToastMessageComponent, {
              ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
              panelClass: ['msb-success'],
            });
          }
        },
        error: (err: { status: number }) => this.handleError(err),
      });
  }

  handleError(err: { status: number }): void {
    if (err.status === 422) {
      this.router.navigate(['/', 'auth', 'disabled']);
    } else {
      const toastMessageData = {
        message: 'Something went wrong. Please try after some time.',
      };

      this.matSnackBar.openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('failure', toastMessageData),
        panelClass: ['msb-failure'],
      });
    }
  }

  onGotoSignInClick(): void {
    this.router.navigate(['/', 'auth', 'sign_in']);
  }
}
