import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { OrgSettingsService } from '../services/org-settings.service';

@Injectable({
  providedIn: 'root',
})
export class BetaPageFeatureFlagGuard {
  private orgSettingsService = inject(OrgSettingsService);

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
