import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { UtilityService } from '../services/utility.service';

@Injectable({
  providedIn: 'root',
})
export class OptInGuard {
  constructor(private utilityService: UtilityService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentRoute = this.router.routerState.snapshot.url;
    const nextRoute = state.url;

    if (currentRoute.includes('my_expenses') && !nextRoute.includes('add_edit')) {
      const canShowOptInPostExpenseCreation = this.utilityService.canShowOptInAfterExpenseCreation();

      if (!canShowOptInPostExpenseCreation) {
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
    }

    if (currentRoute.includes('my_dashboard')) {
      const canShowOptInPostCardAddition = this.utilityService.canShowOptInAfterAddingCard();

      if (!canShowOptInPostCardAddition) {
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
    }

    if (currentRoute.includes('manage_corporate_cards')) {
      const canShowOptInPostCardAddition = this.utilityService.canShowOptInAfterAddingCard();

      if (!canShowOptInPostCardAddition) {
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
    }

    return true;
  }
}
