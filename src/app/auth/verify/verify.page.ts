import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { TrackingService } from '../../core/services/tracking.service';
import { UserEventService } from 'src/app/core/services/user-event.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
  standalone: false,
})
export class VerifyPage implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private routerAuthService: RouterAuthService,
    private authService: AuthService,
    private router: Router,
    private trackingService: TrackingService,
    private userEventService: UserEventService,
  ) {}

  ngOnInit(): void {
    const verificationCode = this.activatedRoute.snapshot.params.verification_code as string;
    this.routerAuthService
      .emailVerify(verificationCode)
      .pipe(
        switchMap(() => this.authService.refreshEou()),
        tap((eou) => {
          this.trackingService.emailVerified();
          this.trackingService.onSignin(eou.us.id);
        }),
      )
      .subscribe({
        next: () => this.router.navigate(['/', 'auth', 'switch_org', { invite_link: true }]),
        error: (err: { status: number }) => this.handleError(err),
      });
  }

  handleError(err: { status: number }): void {
    const orgId = this.activatedRoute.snapshot.params.org_id as string;
    if (err.status === 422) {
      this.trackingService.eventTrack('Go to Disabled User page');
      this.router.navigate(['/', 'auth', 'disabled']);
    } else if (err.status === 440) {
      this.trackingService.eventTrack('Go to Invite Expired page');
      this.router.navigate(['/', 'auth', 'pending_verification', { hasTokenExpired: true, orgId }]);
    } else if (err.status === 406) {
      const queryParams: Record<string, boolean> = {
        tmp_pwd_expired: true,
      };
      this.router.navigate(['/', 'auth', 'reset_password'], { queryParams });
    } else {
      this.logout();
    }
  }

  logout(): void {
    this.userEventService.logout();
    this.router.navigate(['/', 'auth', 'sign_in']);
  }
}
