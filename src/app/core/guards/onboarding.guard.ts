import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrgSettingsService } from '../services/org-settings.service';
import { SpenderOnboardingService } from '../services/spender-onboarding.service';
import { UtilityService } from '../services/utility.service';
import { OnboardingStatus } from '../models/onboarding-status.model';
import { OrgSettings } from '../models/org-settings.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingGuard implements CanActivate {
  constructor(
    private orgSettingsService: OrgSettingsService,
    private spenderOnboardingService: SpenderOnboardingService,
    private utilityService: UtilityService,
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return forkJoin([
      this.orgSettingsService.get(),
      this.spenderOnboardingService.getOnboardingStatus(),
      from(this.utilityService.isUserFromINCluster()),
      this.authService.getEou(),
    ]).pipe(
      map(([orgSettings, onboardingStatus, isUserFromINCluster, eou]) => {
        const isCCCEnabled = this.checkCCCEnabled(orgSettings);
        const isCardFeedEnabled = this.checkCardFeedEnabled(orgSettings);
        const restrictedOrgs = this.isRestrictedOrg(orgSettings, isUserFromINCluster);
        const shouldProceedToOnboarding = this.shouldProceedToOnboarding(
          eou.org.currency,
          restrictedOrgs,
          isCCCEnabled && isCardFeedEnabled,
          onboardingStatus
        );

        return this.handleNavigation(shouldProceedToOnboarding);
      })
    );
  }

  private checkCCCEnabled(orgSettings: OrgSettings): boolean {
    return !!orgSettings.corporate_credit_card_settings.allowed && !!orgSettings.corporate_credit_card_settings.enabled;
  }

  private checkCardFeedEnabled(orgSettings: OrgSettings): boolean {
    return (
      (!!orgSettings.visa_enrollment_settings.allowed && !!orgSettings.visa_enrollment_settings.enabled) ||
      (!!orgSettings.mastercard_enrollment_settings.allowed && !!orgSettings.mastercard_enrollment_settings.enabled) ||
      (!!orgSettings.amex_feed_enrollment_settings.allowed && !!orgSettings.amex_feed_enrollment_settings.enabled)
    );
  }

  private isRestrictedOrg(orgSettings: OrgSettings, isUserFromINCluster: boolean): boolean {
    return orgSettings.org_id === 'orgp5onHZThs' || isUserFromINCluster;
  }

  private shouldProceedToOnboarding(
    currency: string,
    restrictedOrgs: boolean,
    areCardsEnabled: boolean,
    onboardingStatus: OnboardingStatus
  ): boolean {
    return !restrictedOrgs && currency === 'USD' && areCardsEnabled && onboardingStatus.state !== 'COMPLETED';
  }

  private handleNavigation(shouldProceedToOnboarding: boolean): boolean {
    if (shouldProceedToOnboarding) {
      this.router.navigate(['/', 'enterprise', 'spender_onboarding']);
      return false;
    }
    return true;
  }
}
