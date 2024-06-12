import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, map } from 'rxjs';
import { UtilityService } from '../services/utility.service';

@Injectable({
  providedIn: 'root',
})
export class OptInGuard implements CanActivate {
  constructor(private utilityService: UtilityService, private router: Router, private activatedRoute: ActivatedRoute) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentRoute = this.router.routerState.snapshot.url;
    const nextRoute = state.url;

    if (currentRoute.includes('my_expenses;redirected_from_add_expense=true') && !nextRoute.includes('add_edit')) {
      const optInModalPostExpenseCreationFeatureConfig = {
        feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
      };
      return this.utilityService
        .canShowOptInModal(optInModalPostExpenseCreationFeatureConfig)
        .pipe(map((canShowOptInModal) => !canShowOptInModal));
    }

    return true;
  }
}
