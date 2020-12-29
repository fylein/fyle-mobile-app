import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { throwError } from 'rxjs';

enum VerifyPageState {
  verifying,
  error
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
    private router: Router
  ) { }

  ngOnInit() {
    const verificationCode = this.activatedRoute.snapshot.params.verification_code;
    this.routerAuthService.emailVerify(verificationCode).pipe(
      switchMap((resp) => {
        return this.authService.newRefreshToken(resp.refresh_token);
      }),
      tap(() => {
        // TODO: Add when tracking service is added
        //     TrackingService.emailVerified({Asset: 'Mobile'});
        //     TrackingService.onSignin(eou.us.email, {Asset: 'Mobile'});
      }),
      catchError((err) => {
        this.currentPageState = VerifyPageState.error;
        return throwError(err);
      })
    ).subscribe(() => {
      this.router.navigate(['/', 'auth', 'switch_org']);
    });
  }

}
