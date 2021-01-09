import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {finalize, map, switchMap, tap} from 'rxjs/operators';
import {from, Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {LoaderService} from 'src/app/core/services/loader.service';
import {RouterAuthService} from 'src/app/core/services/router-auth.service';
import {AuthService} from 'src/app/core/services/auth.service';
import {PopoverController} from '@ionic/angular';
import {PopupComponent} from './popup/popup.component';

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
  hide = false;


  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private routerAuthService: RouterAuthService,
    private authService: AuthService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.fg = this.fb.group({
      password: ['',
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(12),
            Validators.maxLength(32),
            Validators.pattern(/[A-Z]/),
            Validators.pattern(/[0-9]/),
            Validators.pattern(/[!@#$%^&*()+\-:;<=>{}|~?]/)]
        )]
    });

    this.lengthValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => password && password.length >= 12 && password.length <= 32
      )
    );

    this.uppercaseValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => (/[A-Z]/.test(password))
      )
    );

    this.numberValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => (/[0-9]/.test(password))
      )
    );
    this.specialCharValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => (/[!@#$%^&*()+\-:;<=>{}|~?]/.test(password))
      )
    );
  }

  changePassword() {
    const refreshToken = this.activatedRoute.snapshot.params.refreshToken;

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.routerAuthService.resetPassword(refreshToken, this.fg.controls.password.value);
      }),
      switchMap(res => {
        return this.authService.newRefreshToken(res.refresh_token);
      }),
      tap((eou) => {
        // TODO:  Add when tracking service is added
        // const email = eou.us.email;
        // TrackingService.onSignin(email, { Asset: 'Mobile' });
        // TrackingService.resetPassword({ Asset: 'Mobile' });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(
      async () => {
        const popup = await this.popoverController.create({
          component: PopupComponent,
          componentProps: {
            header: 'Password changed successfully',
            route: ['/', 'auth', 'switch_org']
          },
          cssClass: 'dialog-popover'
        });

        await popup.present();
      },
      async () => {
        const popup = await this.popoverController.create({
          component: PopupComponent,
          componentProps: {
            header: 'Setting new password failed. Please try again later.',
            route: ['/', 'auth', 'sign_in']
          },
          cssClass: 'dialog-popover'
        });

        await popup.present();
      });
  }

}
