import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PopoverController } from '@ionic/angular';
import { PopupComponent } from './popup/popup.component';
import { TrackingService } from '../../core/services/tracking.service';
import { DeviceService } from '../../core/services/device.service';
import { LoginInfoService } from '../../core/services/login-info.service';
import { Router } from '@angular/router';
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

  hidePassword = false;

  hideConfirmPassword = false;

  confirmPasswordIsSame$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private routerAuthService: RouterAuthService,
    private authService: AuthService,
    private popoverController: PopoverController,
    private trackingService: TrackingService,
    private deviceService: DeviceService,
    private loginInfoService: LoginInfoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fg = this.fb.group({
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(32),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/[a-z]/),
          Validators.pattern(/[0-9]/),
          Validators.pattern(/[!@#$%^&*()+\-:;<=>{}|~?]/),
        ]),
      ],
      confirmPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(32),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/[a-z]/),
          Validators.pattern(/[0-9]/),
          Validators.pattern(/[!@#$%^&*()+\-:;<=>{}|~?]/),
        ]),
      ],
    });

    this.lengthValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => password && password.length >= 12 && password.length <= 32)
    );

    this.uppercaseValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => /[A-Z]/.test(password))
    );

    this.numberValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => /[0-9]/.test(password))
    );
    this.specialCharValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => /[!@#$%^&*()+\-:;<=>{}|~?]/.test(password))
    );

    this.lowercaseValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map((password) => /[a-z]/.test(password))
    );
  }

  changePassword() {
    if (this.fg.controls.password.valid && this.fg.controls.password.value === this.fg.controls.confirmPassword.value) {
      const refreshToken = this.activatedRoute.snapshot.params.refreshToken;

      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() => this.routerAuthService.resetPassword(refreshToken, this.fg.controls.password.value)),
          switchMap((res) => this.authService.newRefreshToken(res.refresh_token)),
          tap(async (eou) => {
            const email = eou.us.email;
            this.trackingService.onSignin(email);
            this.trackingService.resetPassword();
            await this.trackLoginInfo();
          }),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe(
          async () => {
            const popup = await this.popoverController.create({
              component: PopupComponent,
              componentProps: {
                header: 'Password changed successfully',
                route: ['/', 'auth', 'switch_org'],
                success: true,
                message: 'Signing you in',
              },
              cssClass: 'pop-up-in-center',
            });

            await popup.present();

            setTimeout(() => {
              this.popoverController.dismiss();
              this.router.navigate(['/', 'auth', 'switch_org']);
            }, 1000);
          },
          async () => {
            const popup = await this.popoverController.create({
              component: PopupComponent,
              componentProps: {
                header: 'Setting new password failed. Please try again later.',
                route: ['/', 'auth', 'sign_in'],
                success: false,
              },
              cssClass: 'pop-up-in-center',
            });

            await popup.present();

            setTimeout(() => {
              this.popoverController.dismiss();
              this.router.navigate(['/', 'auth', 'switch_org']);
            }, 1000);
          }
        );
    }
  }

  checkConfirmPassword() {
    this.confirmPasswordIsSame$ = this.fg.controls.confirmPassword.valueChanges.pipe(
      map((confirmPassword) => this.fg.controls.password.value.indexOf(confirmPassword) === 0)
    );
  }

  async trackLoginInfo() {
    const deviceInfo = await this.deviceService.getDeviceInfo().toPromise();
    this.trackingService.eventTrack('Added Login Info', { label: deviceInfo.appVersion });
    await this.loginInfoService.addLoginInfo(deviceInfo.appVersion, new Date());
  }
}
