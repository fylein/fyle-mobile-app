import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, map, of, switchMap } from 'rxjs';
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
      return this.utilityService.canShowOptInAfterExpenseCreation().pipe(
        switchMap((canShowOptIn) => {
          if (!canShowOptIn) {
            return of(true);
          } else {
            const optInModalPostExpenseCreationFeatureConfig = {
              feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
              key: 'OPT_IN_POPUP_SHOWN_COUNT',
            };
            return this.utilityService
              .canShowOptInModal(optInModalPostExpenseCreationFeatureConfig)
              .pipe(map((canShowOptInModal) => !canShowOptInModal));
          }
        })
      );
    }

    if (currentRoute.includes('my_dashboard')) {
      return this.utilityService.canShowOptInAfterAddingCard().pipe(
        switchMap((canShowOptIn) => {
          if (!canShowOptIn) {
            return of(true);
          } else {
            const optInModalPostCardAdditionFeatureConfig = {
              feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
              key: 'OPT_IN_POPUP_SHOWN_COUNT',
            };
            return this.utilityService
              .canShowOptInModal(optInModalPostCardAdditionFeatureConfig)
              .pipe(map((canShowOptInModal) => !canShowOptInModal));
          }
        })
      );
    }

    if (currentRoute.includes('manage_corporate_cards')) {
      return this.utilityService.canShowOptInAfterAddingCard().pipe(
        switchMap((canShowOptIn) => {
          if (!canShowOptIn) {
            return of(true);
          } else {
            const optInModalPostCardAdditionFeatureConfig = {
              feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
              key: 'OPT_IN_POPUP_SHOWN_COUNT',
            };
            return this.utilityService
              .canShowOptInModal(optInModalPostCardAdditionFeatureConfig)
              .pipe(map((canShowOptInModal) => !canShowOptInModal));
          }
        })
      );
    }

    return true;
  }
}
