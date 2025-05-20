import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { SpenderOnboardingService } from '../services/spender-onboarding.service';
import { LoaderService } from '../services/loader.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingGuard {
  constructor(
    private spenderOnboardingService: SpenderOnboardingService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.spenderOnboardingService.checkForRedirectionToOnboarding()),
      map((shouldRedirectToOnboarding) => {
        if (shouldRedirectToOnboarding) {
          this.router.navigate(['/', 'enterprise', 'spender_onboarding']);
          return false;
        }
        return true;
      }),
      catchError(() => of(true)),
      finalize(() => this.loaderService.hideLoader())
    );
  }
}
