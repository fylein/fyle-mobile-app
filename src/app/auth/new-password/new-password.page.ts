import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.page.html',
  styleUrls: ['./new-password.page.scss'],
})
export class NewPasswordPage implements OnInit {
  fg: UntypedFormGroup;

  lengthValidationDisplay$: Observable<boolean>;

  uppercaseValidationDisplay$: Observable<boolean>;

  numberValidationDisplay$: Observable<boolean>;

  specialCharValidationDisplay$: Observable<boolean>;

  lowercaseValidationDisplay$: Observable<boolean>;

  hide = false;

  constructor(
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private routerAuthService: RouterAuthService,
    private authService: AuthService,
    private popoverController: PopoverController,
    private trackingService: TrackingService,
    private deviceService: DeviceService,
    private loginInfoService: LoginInfoService
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
            },
            cssClass: 'dialog-popover',
          });

          await popup.present();
        },
        async () => {
          const popup = await this.popoverController.create({
            component: PopupComponent,
            componentProps: {
              header: 'Setting new password failed. Please try again later.',
              route: ['/', 'auth', 'sign_in'],
            },
            cssClass: 'dialog-popover',
          });

          await popup.present();
        }
      );
  }

  async trackLoginInfo() {
    const deviceInfo = await this.deviceService.getDeviceInfo().toPromise();
    this.trackingService.eventTrack('Added Login Info', { label: deviceInfo.appVersion });
    await this.loginInfoService.addLoginInfo(deviceInfo.appVersion, new Date());
  }
}
