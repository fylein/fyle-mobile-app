import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { OrgSettingsService } from '../services/org-settings.service';

@Injectable({
  providedIn: 'root',
})
export class MyExpensesGuardGuard implements CanActivate {
  constructor(private orgSettingsSerivce: OrgSettingsService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.orgSettingsSerivce.get().subscribe((orgSettings) => {
      if (!orgSettings?.mobile_app_my_expenses_beta_enabled) {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
    return true;
  }
}
