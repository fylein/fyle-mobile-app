import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { noop, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PageState } from 'src/app/core/models/page-state.enum';

@Component({
  selector: 'app-pending-verification',
  templateUrl: './pending-verification.page.html',
})
export class PendingVerificationPage implements OnInit {
  currentPageState: PageState;

  isLoading = false;

  constructor(private routerAuthService: RouterAuthService, private router: Router) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.currentPageState = PageState.notSent;
  }

  resendVerificationLink(email: string) {
    this.isLoading = true;

    this.routerAuthService
      .resendVerificationLink(email)
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
      .subscribe({
        next: () => (this.currentPageState = PageState.success),
        error: noop,
      });
  }
}
