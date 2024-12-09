import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-pending-verification',
  templateUrl: './pending-verification.page.html',
  styleUrls: ['./pending-verification.page.scss'],
})
export class PendingVerificationPage {
  isLoading = false;

  isInvitationLinkSent = false;

  fg: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private routerAuthService: RouterAuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  ionViewWillEnter(): void {
    this.fg = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
    });
  }

  resendVerificationLink(email: string): void {
    this.isLoading = true;
    const orgId = this.activatedRoute.snapshot.params.orgId as string;

    this.routerAuthService
      .resendVerificationLink(email, orgId)
      .pipe(tap(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.isInvitationLinkSent = true;
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  handleError(err: HttpErrorResponse): void {
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
