import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PageState } from 'src/app/core/models/page-state.enum';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage implements OnInit {
  currentPageState: PageState;

  isLoading = false;

  constructor(private routerAuthService: RouterAuthService, private router: Router) {}

  ionViewWillEnter() {
    this.currentPageState = PageState.notSent;
  }

  ngOnInit() {}

  sendResetLink(email: string) {
    this.isLoading = true;

    this.routerAuthService
      .sendResetPassword(email)
      .pipe(tap(() => (this.isLoading = false)))
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
