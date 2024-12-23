import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.page.html',
  styleUrls: ['./new-password.page.scss'],
})
export class NewPasswordPage implements OnInit {
  fg: FormGroup;

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

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private routerAuthService: RouterAuthService,
    private authService: AuthService,
    private trackingService: TrackingService,
    private deviceService: DeviceService,
    private loginInfoService: LoginInfoService,
    private router: Router,
    private matSnackBar: MatSnackBar,
    private snackbarPropertiesService: SnackbarPropertiesService
  ) {}

  ngOnInit(): void {
    this.fg = this.fb.group({
      password: ['', [Validators.required, this.checkPasswordValidity]],
      confirmPassword: ['', [Validators.required, this.validatePasswordEquality]],
    });
  }

  changePassword(): void {
    const refreshToken = this.activatedRoute.snapshot.params.refreshToken as string;
    this.isLoading = true;
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.routerAuthService.resetPassword(refreshToken, this.fg.controls.password.value as string)),
        switchMap(() => this.authService.refreshEou()),
        tap(async (eou) => {
          const email = eou.us.email;
          this.trackingService.onSignin(email);
          this.trackingService.resetPassword();
          await this.trackLoginInfo();
        }),
        finalize(() => {
          this.isLoading = false;
          return from(this.loaderService.hideLoader());
        })
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
        }
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
