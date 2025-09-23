import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';

@Injectable({
  providedIn: 'root',
})
export class BetaPageFeatureFlagGuard {
  private orgSettingsService = inject(PlatformOrgSettingsService);

  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentPath = route.routeConfig && route.routeConfig.path;

    if (currentPath) {
      return this.orgSettingsService.isBetaPageEnabledForPath(currentPath).pipe(
        map((isBetaPageEnabled) => {
          if (isBetaPageEnabled) {
            this.router.navigate(['/', 'enterprise', `${currentPath}_beta`, { ...route.params }]);
            return false;
          }
          return true;
        }),
      );
    } else {
      return of(true);
    }
  }
}
