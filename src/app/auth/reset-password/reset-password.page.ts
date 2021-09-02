import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { from, throwError } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';

enum ResetPasswordPageState {
  notSent,
  success,
  failure,
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  fg: FormGroup;

  currentPageState: ResetPasswordPageState = ResetPasswordPageState.notSent;

  emailSet = false;

  resetLinkLoader = false;

  get pageStates() {
    return ResetPasswordPageState;
  }

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private routerAuthService: RouterAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const email = this.activatedRoute.snapshot.params.email || '';
    this.fg = this.fb.group({
      email: [email, Validators.required],
    });
  }

  sendResetLink() {
    if (this.fg.controls.email.valid) {
      this.resetLinkLoader = true;

      this.routerAuthService
        .sendResetPassword(this.fg.controls.email.value)
        .pipe(
          finalize(async () => {
            this.resetLinkLoader = false;
          }),
          catchError((err) => {
            if (err.status === 422) {
              this.router.navigate(['/', 'auth', 'disabled']);
            } else {
              this.currentPageState = this.pageStates.failure;
            }
            return throwError(err);
          })
        )
        .subscribe(() => {
          this.currentPageState = this.pageStates.success;
        });
    } else {
      this.fg.controls.email.markAsTouched();
    }
  }
}
