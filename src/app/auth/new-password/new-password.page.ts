import { Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { TrackingService } from '../../core/services/tracking.service';
import { DeviceService } from '../../core/services/device.service';
import { LoginInfoService } from '../../core/services/login-info.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { NgClass } from '@angular/common';
import { MatSuffix } from '@angular/material/input';
import { PasswordCheckTooltipComponent } from '../../shared/components/password-check-tooltip/password-check-tooltip.component';
import { FormButtonValidationDirective } from '../../shared/directive/form-button-validation.directive';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';


@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.page.html',
  styleUrls: ['./new-password.page.scss'],
  imports: [
    FormButtonValidationDirective,
    FormsModule,
    IonButton,
    IonContent,
    IonIcon,
    MatSuffix,
    NgClass,
    PasswordCheckTooltipComponent,
    ReactiveFormsModule
  ],
})
export class NewPasswordPage implements OnInit {
  private fb = inject(UntypedFormBuilder);

  private activatedRoute = inject(ActivatedRoute);

  private loaderService = inject(LoaderService);

  private routerAuthService = inject(RouterAuthService);

  private authService = inject(AuthService);

  private trackingService = inject(TrackingService);

  private deviceService = inject(DeviceService);

  private loginInfoService = inject(LoginInfoService);

  private router = inject(Router);

  private matSnackBar = inject(MatSnackBar);

  private snackbarPropertiesService = inject(SnackbarPropertiesService);

  fg: UntypedFormGroup;

  lengthValidationDisplay$: Observable<boolean>;

  uppercaseValidationDisplay$: Observable<boolean>;

  numberValidationDisplay$: Observable<boolean>;

  specialCharValidationDisplay$: Observable<boolean>;

  lowercaseValidationDisplay$: Observable<boolean>;

  isPasswordValid = false;

  hide = true;

  hideConfirmPassword = true;

  showPasswordTooltip = false;

  isLoading = false;

  focusOnPassword = false;

  focusOnConfirmPassword = false;

  ngOnInit(): void {
    this.fg = this.fb.group({
      password: ['', [Validators.required, this.checkPasswordValidity]],
      confirmPassword: ['', [Validators.required, this.validatePasswordEquality]],
    });
    this.trackingService.eventTrack('Reset Password page opened');
  }

  changePassword(): void {
    const refreshToken = this.activatedRoute.snapshot.params.token as string;
    this.isLoading = true;
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.routerAuthService.resetPassword(refreshToken, this.fg.controls.password.value as string)),
        switchMap(() => this.authService.refreshEou()),
        tap(async (eou) => {
          this.trackingService.onSignin(eou.us.id);
          this.trackingService.resetPassword();
          await this.trackLoginInfo();
        }),
        finalize(() => {
          this.isLoading = false;
          return from(this.loaderService.hideLoader());
        }),
      )
      .subscribe(
        () => {
          const toastMessageData = {
            message: 'Password changed successfully',
          };

          this.matSnackBar.openFromComponent(ToastMessageComponent, {
            ...this.snackbarPropertiesService.setSnackbarProperties('success', toastMessageData),
            panelClass: ['msb-success'],
          });
          this.router.navigate(['/', 'auth', 'switch_org']);
        },
        () => {
          const toastMessageData = {
            message: 'Something went wrong. Please try after some time.',
          };

          this.matSnackBar.openFromComponent(ToastMessageComponent, {
            ...this.snackbarPropertiesService.setSnackbarProperties('failure', toastMessageData),
            panelClass: ['msb-failure'],
          });
          this.router.navigate(['/', 'auth', 'sign_in']);
        },
      );
  }

  async trackLoginInfo(): Promise<void> {
    const deviceInfo = await this.deviceService.getDeviceInfo().toPromise();
    this.trackingService.eventTrack('Added Login Info', { label: deviceInfo.appVersion });
    await this.loginInfoService.addLoginInfo(deviceInfo.appVersion, new Date());
  }

  onPasswordValid(isValid: boolean): void {
    this.isPasswordValid = isValid;
    this.fg.controls.password.updateValueAndValidity();
    this.fg.controls.confirmPassword.updateValueAndValidity();
  }

  redirectToSignIn(): void {
    this.router.navigate(['/', 'auth', 'sign_in']);
  }

  setPasswordTooltip(value: boolean): void {
    this.focusOnPassword = value;
    this.showPasswordTooltip = value;
  }

  checkPasswordValidity = (): ValidationErrors => (this.isPasswordValid ? null : { invalidPassword: true });

  validatePasswordEquality = (): ValidationErrors => {
    if (!this.fg) {
      return null;
    }
    const password = this.fg.controls.password.value as string;
    const confirmPassword = this.fg.controls.confirmPassword.value as string;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
