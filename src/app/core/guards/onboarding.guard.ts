import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SpenderOnboardingService } from '../services/spender-onboarding.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingGuard {
  private spenderOnboardingService = inject(SpenderOnboardingService);

  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return from(this.spenderOnboardingService.checkForRedirectionToOnboarding()).pipe(
      map((shouldRedirectToOnboarding) => {
        if (shouldRedirectToOnboarding) {
          this.router.navigate(['/', 'enterprise', 'spender_onboarding']);
          return false;
        }
        return true;
      }),
      catchError(() => of(true)),
    );
  }
}
