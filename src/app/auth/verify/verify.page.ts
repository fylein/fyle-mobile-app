import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { TrackingService } from '../../core/services/tracking.service';
import { VerifyPageState } from './verify.enum';

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

  get PageStates(): typeof VerifyPageState {
    return VerifyPageState;
  }

  ngOnInit(): void {
    const verificationCode = this.activatedRoute.snapshot.params.verification_code as string;
    this.routerAuthService
      .emailVerify(verificationCode)
      .pipe(
        switchMap((resp) => this.authService.newRefreshToken(resp.refresh_token)),
        tap((eou) => {
          this.trackingService.emailVerified();
          this.trackingService.onSignin(eou.us.email);
        })
      )
      .subscribe({
        next: () => this.router.navigate(['/', 'auth', 'switch_org', { invite_link: true }]),
        error: (err) => this.handleError(err),
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(err: any): void {
    const orgId = this.activatedRoute.snapshot.params.org_id as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (err.status === 422) {
      this.router.navigate(['/', 'auth', 'disabled']);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (err.status === 440) {
      this.router.navigate(['/', 'auth', 'pending_verification', { hasTokenExpired: true, orgId }]);
    } else {
      this.currentPageState = VerifyPageState.error;
    }
  }
}
