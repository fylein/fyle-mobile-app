import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, map, Observable } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { OnboardingWelcomeStepStatus } from '../models/onboarding-welcome-step-status.model';
import { OnboardingStepStatus } from '../models/onboarding-step-status.model';
import { OnboardingStatus } from '../models/onboarding-status.model';
import { UtilityService } from './utility.service';
import { AuthService } from './auth.service';
import { OrgSettingsService } from './org-settings.service';
import { OrgSettings } from '../models/org-settings.model';

@Injectable({
  providedIn: 'root',
})
export class SpenderOnboardingService {
  onboardingComplete$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private utilityService: UtilityService,
    private authService: AuthService,
    private orgSettingsService: OrgSettingsService
  ) {}

  getOnboardingStatus(): Observable<OnboardingStatus> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<OnboardingStatus>>('/onboarding')
      .pipe(map((res) => res.data));
  }

  processConnectCardsStep(data: OnboardingStepStatus): Observable<OnboardingStepStatus> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<OnboardingStepStatus>>('/onboarding/process_step_connect_cards', {
        data,
      })
      .pipe(map((res) => res.data));
  }

  processSmsOptInStep(data: OnboardingStepStatus): Observable<OnboardingStepStatus> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<OnboardingStepStatus>>('/onboarding/process_step_sms_opt_in', { data })
      .pipe(map((res) => res.data));
  }

  processWelcomeModalStep(data: OnboardingWelcomeStepStatus): Observable<OnboardingWelcomeStepStatus> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<OnboardingWelcomeStepStatus>>('/onboarding/process_step_show_welcome_modal', {
        data,
      })
      .pipe(map((res) => res.data));
  }

  markWelcomeModalStepAsComplete(): Observable<OnboardingWelcomeStepStatus> {
    const data: OnboardingWelcomeStepStatus = {
      is_complete: true,
    };
    return this.processWelcomeModalStep(data);
  }

  markConnectCardsStepAsComplete(): Observable<OnboardingStepStatus> {
    const data: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    return this.processConnectCardsStep(data);
  }

  skipConnectCardsStep(): Observable<OnboardingStepStatus> {
    const data: OnboardingStepStatus = {
      is_configured: false,
      is_skipped: true,
    };
    return this.processConnectCardsStep(data);
  }

  markSmsOptInStepAsComplete(): Observable<OnboardingStepStatus> {
    const data: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    return this.processSmsOptInStep(data);
  }

  skipSmsOptInStep(): Observable<OnboardingStepStatus> {
    const data: OnboardingStepStatus = {
      is_configured: false,
      is_skipped: true,
    };
    return this.processSmsOptInStep(data);
  }

  setOnboardingStatusAsComplete(): Observable<boolean> {
    return this.onboardingComplete$.asObservable();
  }

  setOnboardingStatusEvent(): void {
    this.onboardingComplete$.next(true);
  }

  checkForRedirectionToOnboarding(): Observable<boolean> {
    return forkJoin([
      this.orgSettingsService.get(),
      this.getOnboardingStatus(),
      from(this.utilityService.isUserFromINCluster()),
      this.authService.getEou(),
    ]).pipe(
      map(([orgSettings, onboardingStatus, isUserFromINCluster, eou]) => {
        const isCCCEnabled = this.checkCCCEnabled(orgSettings);
        const isCardFeedEnabled = this.checkCardFeedEnabled(orgSettings);
        const restrictedOrgs = this.isRestrictedOrg(orgSettings, isUserFromINCluster);
        return this.shouldProceedToOnboarding(
          eou.org.currency,
          restrictedOrgs,
          isCCCEnabled && isCardFeedEnabled,
          onboardingStatus
        );
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
}
