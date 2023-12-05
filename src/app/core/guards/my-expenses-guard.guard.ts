import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { OrgSettingsService } from '../services/org-settings.service';

import { OrgSettings } from '../models/org-settings.model';

@Injectable({
  providedIn: 'root',
})
export class MyExpensesGuardGuard implements CanActivate {
  constructor(private orgSettingsSerivce: OrgSettingsService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.orgSettingsSerivce.get().pipe(
      tap((orgSettings) => console.log(orgSettings)),
      map((orgSettings: OrgSettings) => {
        if (orgSettings.mobile_app_my_expenses_beta_enabled) {
          this.router.navigate(['/', 'enterprise', 'my_expenses-v2']);
        }

        return true;
      })
    );
  }
}
