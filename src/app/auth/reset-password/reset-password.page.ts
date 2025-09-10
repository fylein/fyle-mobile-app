import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PageState } from 'src/app/core/models/page-state.enum';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { MatInput } from '@angular/material/input';
import { FormButtonValidationDirective } from '../../shared/directive/form-button-validation.directive';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule, MatInput, FormButtonValidationDirective],
})
export class ResetPasswordPage {
  private formBuilder = inject(UntypedFormBuilder);

  private routerAuthService = inject(RouterAuthService);

  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  currentPageState: PageState;

  isLoading = false;

  fg: UntypedFormGroup;

  resetEmail: string;

  isEmailSentOnce: boolean;

  PageState: typeof PageState = PageState;

  isTmpPwdExpired = false;

  ionViewWillEnter(): void {
    this.currentPageState = PageState.notSent;
    this.isEmailSentOnce = false;
    this.isTmpPwdExpired = this.activatedRoute.snapshot.queryParams.tmp_pwd_expired === 'true';
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
        }),
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
    this.router.navigate(['/', 'auth', 'sign_in', { email: this.fg.controls.email.value as string }]);
  }
}
