import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { TrackingService } from '../../core/services/tracking.service';
import { throwError } from 'rxjs';

enum VerifyPageState {
  verifying,
  error,
}

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
})
export class VerifyPage implements OnInit {
  currentPageState: VerifyPageState = VerifyPageState.verifying;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routerAuthService: RouterAuthService,
    private authService: AuthService,
    private router: Router,
    private trackingService: TrackingService
  ) {}

  get PageStates() {
    return VerifyPageState;
  }

  ngOnInit() {
    const verificationCode = this.activatedRoute.snapshot.params.verification_code;
    this.routerAuthService
      .emailVerify(verificationCode)
      .pipe(
        switchMap((resp) => this.authService.newRefreshToken(resp.refresh_token)),
        tap((eou) => {
          this.trackingService.emailVerified();
          this.trackingService.onSignin(eou.us.email);
        }),
        catchError((err) => {
          if (err.status === 422) {
            this.router.navigate(['/', 'auth', 'disabled']);
          } else if (err.status === 440) {
            this.router.navigate(['/', 'auth', 'pending_verification', { hasTokenExpired: true }]);
          } else {
            this.currentPageState = VerifyPageState.error;
          }
          return throwError(err);
        })
      )
      .subscribe({
        next: () => this.router.navigate(['/', 'auth', 'switch_org', { invite_link: true }]),
        error: () => (this.currentPageState = VerifyPageState.error),
      });
  }
}
