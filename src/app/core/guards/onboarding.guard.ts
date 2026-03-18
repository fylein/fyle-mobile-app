import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SpenderOnboardingService } from '../services/spender-onboarding.service';
import { DelegationService } from '../services/delegation.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingGuard {
  private spenderOnboardingService = inject(SpenderOnboardingService);

  private delegationService = inject(DelegationService);

  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return from(this.delegationService.inDelegateeMode()).pipe(
      switchMap((inDelegateeMode) => {
        // When switched to a delegator account, skip onboarding checks entirely.
        if (inDelegateeMode) {
          return of(true);
        }

        return from(this.spenderOnboardingService.checkForRedirectionToOnboarding()).pipe(
          map((shouldRedirectToOnboarding) => {
            if (shouldRedirectToOnboarding) {
              this.router.navigate(['/', 'enterprise', 'spender_onboarding']);
              return false;
            }
            return true;
          }),
        );
      }),
      catchError(() => of(true)),
    );
  }
}
