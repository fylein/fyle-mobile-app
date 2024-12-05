import { Component, OnInit, EventEmitter } from '@angular/core';
import { Observable, noop, concat, from } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { switchMap, finalize, tap } from 'rxjs/operators';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { TrackingService } from '../../core/services/tracking.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';

@Component({
  selector: 'app-invited-user',
  templateUrl: './invited-user.page.html',
  styleUrls: ['./invited-user.page.scss'],
})
export class InvitedUserPage implements OnInit {
  isConnected$: Observable<boolean>;

  fg: FormGroup;

  eou$: Observable<ExtendedOrgUser>;

  hide = true;

  hideConfirmPassword = true;

  orgName: string;

  isPasswordValid = false;

  lengthValidationDisplay$: Observable<boolean>;

  uppercaseValidationDisplay$: Observable<boolean>;

  numberValidationDisplay$: Observable<boolean>;

  specialCharValidationDisplay$: Observable<boolean>;

  lowercaseValidationDisplay$: Observable<boolean>;

  showPasswordTooltip = false;

  arePasswordsEqual = false;

  constructor(
    private networkService: NetworkService,
    private fb: FormBuilder,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService,
    private authService: AuthService,
    private router: Router,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  ngOnInit(): void {
    const networkWatcherEmitter = this.networkService.connectivityWatcher(new EventEmitter<boolean>());
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe(noop);

    this.fg = this.fb.group({
      fullName: ['', Validators.compose([Validators.required, Validators.pattern(/[A-Za-z]/)])],
      password: ['', [Validators.required, this.customPasswordValidator]],
      confirmPassword: ['', [Validators.required, this.validatePasswordEquality]],
    });

    this.eou$ = from(this.authService.getEou());

    this.eou$.subscribe((eou) => {
      this.fg.controls.fullName.setValue(eou?.us?.full_name);
      this.orgName = eou.ou.org_name;
    });
  }

  onPasswordValid(isValid: boolean): void {
    this.isPasswordValid = isValid;
    this.fg.controls.password.updateValueAndValidity();
  }

  setPasswordTooltip(value: boolean): void {
    this.showPasswordTooltip = value;
  }

  async saveData(): Promise<void> {
    this.fg.markAllAsTouched();
    if (this.fg.valid) {
      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() => this.eou$),
          switchMap((eou) => {
            const user = eou.us;
            user.full_name = this.fg.controls.fullName.value as string;
            user.password = this.fg.controls.password.value as string;
            return this.orgUserService.postUser(user);
          }),
          tap(() => this.trackingService.setupComplete()),
          switchMap(() => this.authService.refreshEou()),
          switchMap(() => this.orgUserService.markActive()),
          tap(() => this.trackingService.activated()),
          finalize(async () => await this.loaderService.hideLoader())
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'my_dashboard']);
          // return $state.go('enterprise.my_dashboard');
        });
    } else {
      const message = `Please enter a valid ${!this.fg.controls.fullName.valid ? 'name' : 'password'}`;
      this.matSnackBar.openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('failure', { message }),
        panelClass: ['msb-failure'],
      });
      this.trackingService.showToastMessage({ ToastContent: message });
    }
  }

  redirectToSignIn(): void {
    this.router.navigate(['/', 'auth', 'sign_in']);
  }

  customPasswordValidator = (): ValidationErrors => (this.isPasswordValid ? null : { invalidPassword: true });

  validatePasswordEquality = (): ValidationErrors => {
    if (!this.fg) {
      return null;
    }
    const password = this.fg.controls.password.value as string;
    const confirmPassword = this.fg.controls.confirmPassword.value as string;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
