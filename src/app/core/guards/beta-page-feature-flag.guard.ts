import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { OrgSettingsService } from '../services/org-settings.service';

@Injectable({
  providedIn: 'root',
})
export class BetaPageFeatureFlagGuard {
  constructor(private orgSettingsService: OrgSettingsService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
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
        })
      );
    } else {
      return of(true);
    }
  }
}
