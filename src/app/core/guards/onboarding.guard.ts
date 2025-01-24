import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpenderOnboardingService } from '../services/spender-onboarding.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingGuard implements CanActivate {
  constructor(private spenderOnboardingService: SpenderOnboardingService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.spenderOnboardingService.checkForRedirectionToOnboarding().pipe(
      map((shouldRedirectToOnboarding) => {
        if (shouldRedirectToOnboarding) {
          this.router.navigate(['/', 'enterprise', 'spender_onboarding']);
          return false;
        }
        return true;
      })
    );
  }
}
