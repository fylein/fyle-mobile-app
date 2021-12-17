import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PageState } from 'src/app/core/models/page-state.model';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage implements OnInit {
  currentPageState: PageState = PageState.notSent;

  isLoading = false;

  constructor(private routerAuthService: RouterAuthService, private router: Router) {}

  ngOnInit() {}

  sendResetLink(email: string) {
    this.isLoading = true;

    this.routerAuthService
      .sendResetPassword(email)
      .pipe(
        finalize(async () => {
          this.isLoading = false;
        }),
        catchError((err) => {
          if (err.status === 422) {
            this.router.navigate(['/', 'auth', 'disabled']);
          } else {
            this.currentPageState = PageState.failure;
          }
          return throwError(err);
        })
      )
      .subscribe(() => {
        this.currentPageState = PageState.success;
      });
  }
}
