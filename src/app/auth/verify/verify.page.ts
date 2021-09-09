import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { throwError } from 'rxjs';
import { TrackingService } from '../../core/services/tracking.service';

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

  get PageStates() {
    return VerifyPageState;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private routerAuthService: RouterAuthService,
    private authService: AuthService,
    private router: Router,
    private trackingService: TrackingService
  ) {}

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
          this.currentPageState = VerifyPageState.error;
          return throwError(err);
        })
      )
      .subscribe(() => {
        this.router.navigate(['/', 'auth', 'switch_org']);
      });
  }
}
