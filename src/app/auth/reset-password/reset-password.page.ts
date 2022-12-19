import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PageState } from 'src/app/core/models/page-state.enum';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage {
  currentPageState: PageState;

  isLoading = false;

  onPageExit$: Subject<void>;

  constructor(private routerAuthService: RouterAuthService, private router: Router) {}

  ionViewWillEnter() {
    this.currentPageState = PageState.notSent;
    this.onPageExit$ = new Subject();
  }

  ionViewWillLeave() {
    this.onPageExit$.next();
    this.onPageExit$.complete();
  }

  sendResetLink(email: string) {
    this.isLoading = true;

    this.routerAuthService
      .sendResetPassword(email)
      .pipe(
        tap(() => (this.isLoading = false)),
        takeUntil(this.onPageExit$)
      )
      .subscribe({
        next: () => (this.currentPageState = PageState.success),
        error: (err) => this.handleError(err),
      });
  }

  handleError(err) {
    if (err.status === 422) {
      this.router.navigate(['/', 'auth', 'disabled']);
    } else {
      this.currentPageState = PageState.failure;
    }
  }
}
