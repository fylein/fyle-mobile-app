import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SpenderOnboardingService } from '../services/spender-onboarding.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingGuard implements CanActivate {
  constructor(
    private spenderOnboardingService: SpenderOnboardingService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.spenderOnboardingService.checkForRedirectionToOnboarding().pipe(
      map((shouldRedirectToOnboarding) => {
        if (shouldRedirectToOnboarding) {
          this.router.navigate(['/', 'enterprise', 'spender_onboarding']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        return of(true);
      })
    );
  }
}
