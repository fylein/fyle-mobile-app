import { Component } from '@angular/core';
import { finalize, forkJoin, from, map, switchMap } from 'rxjs';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OnboardingStep } from './models/onboarding-step.enum';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Router } from '@angular/router';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { OnboardingStatus } from 'src/app/core/models/onboarding-status.model';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';

@Component({
  selector: 'app-spender-onboarding',
  templateUrl: './spender-onboarding.page.html',
  styleUrls: ['./spender-onboarding.page.scss'],
})
export class SpenderOnboardingPage {
  isLoading = true;

  userFullName: string;

  currentStep: OnboardingStep = OnboardingStep.CONNECT_CARD;

  showOneStep = false;

  onboardingStep: typeof OnboardingStep = OnboardingStep;

  eou: ExtendedOrgUser;

  orgSettings: OrgSettings;

  onboardingComplete = false;

  onboardingInProgress = true;

  redirectionCount = 3;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private spenderOnboardingService: SpenderOnboardingService,
    private orgSettingsService: OrgSettingsService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private router: Router,
    private trackingService: TrackingService
  ) {}

  isMobileVerified(eou: ExtendedOrgUser): boolean {
    return !!(eou.ou.mobile && eou.ou.mobile_verified);
  }

  setPostOnboardingScreen(isComplete?: boolean): void {
    this.spenderOnboardingService.setOnboardingStatusEvent();
    if (isComplete) {
      this.onboardingComplete = true;
      this.startCountdown();
    } else {
      this.router.navigate(['/', 'enterprise', 'my_dashboard']);
    }
  }

  completeOnboarding(isComplete?: boolean): void {
    this.onboardingInProgress = false;
    this.spenderOnboardingService
      .markWelcomeModalStepAsComplete()
      .pipe(
        map(() => {
          this.setPostOnboardingScreen(isComplete);
        })
      )
      .subscribe();
  }

  setUpRtfSteps(onboardingStatus: OnboardingStatus, rtfCards: PlatformCorporateCard[]): void {
    if (
      onboardingStatus.step_connect_cards_is_skipped ||
      onboardingStatus.step_connect_cards_is_configured ||
      rtfCards.length > 0
    ) {
      this.currentStep = OnboardingStep.OPT_IN;
      if (onboardingStatus.step_connect_cards_is_configured) {
        this.showOneStep = true;
      }
    } else {
      this.currentStep = OnboardingStep.CONNECT_CARD;
      if (this.isMobileVerified(this.eou)) {
        this.showOneStep = true;
      }
    }
  }

  ionViewWillEnter(): void {
    this.isLoading = true;
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          forkJoin([
            this.orgUserService.getCurrent(),
            this.orgSettingsService.get(),
            this.spenderOnboardingService.getOnboardingStatus(),
            this.corporateCreditCardExpenseService.getCorporateCards(),
          ])
        ),
        map(([eou, orgSettings, onboardingStatus, corporateCards]) => {
          this.eou = eou;
          this.userFullName = eou.us.full_name;
          this.orgSettings = orgSettings;
          const isRtfEnabled =
            orgSettings.visa_enrollment_settings.enabled || orgSettings.mastercard_enrollment_settings.enabled;
          const isAmexFeedEnabled = orgSettings.amex_feed_enrollment_settings.enabled;
          const rtfCards = corporateCards.filter((card) => card.is_visa_enrolled || card.is_mastercard_enrolled);
          if (this.isMobileVerified(this.eou) && rtfCards.length > 0) {
            this.completeOnboarding();
          } else if (isAmexFeedEnabled && !isRtfEnabled) {
            this.currentStep = OnboardingStep.OPT_IN;
            this.showOneStep = true;
          } else if (isRtfEnabled) {
            // If Connect Card was skipped earlier or Cards are already enrolled, then go to OPT_IN step
            this.setUpRtfSteps(onboardingStatus, rtfCards);
          }
        }),
        finalize(() => {
          this.isLoading = false;
          return from(this.loaderService.hideLoader());
        })
      )
      .subscribe();
  }

  goBackToConnectCard(): void {
    this.currentStep = OnboardingStep.CONNECT_CARD;
  }

  skipOnboardingStep(): void {
    if (this.currentStep === OnboardingStep.CONNECT_CARD) {
      this.spenderOnboardingService
        .skipConnectCardsStep()
        .pipe(
          map(() => {
            this.trackingService.eventTrack('Connect Cards Onboarding Step - Skipped');
            if (this.isMobileVerified(this.eou)) {
              this.completeOnboarding();
            } else {
              this.currentStep = OnboardingStep.OPT_IN;
            }
          })
        )
        .subscribe();
    } else if (this.currentStep === OnboardingStep.OPT_IN) {
      this.onboardingInProgress = false;
      this.spenderOnboardingService
        .skipSmsOptInStep()
        .pipe(
          map(() => {
            this.trackingService.eventTrack('Sms Opt In Onboarding Step - Skipped');
            this.navigateOnSkippedOnboarding();
          })
        )
        .subscribe();
    }
  }

  markStepAsComplete(): void {
    if (this.currentStep === OnboardingStep.CONNECT_CARD) {
      this.spenderOnboardingService
        .markConnectCardsStepAsComplete()
        .pipe(
          map(() => {
            if (this.isMobileVerified(this.eou)) {
              this.completeOnboarding(true);
            } else {
              this.currentStep = OnboardingStep.OPT_IN;
            }
          })
        )
        .subscribe();
    } else if (this.currentStep === OnboardingStep.OPT_IN) {
      this.onboardingInProgress = false;
      this.spenderOnboardingService
        .markSmsOptInStepAsComplete()
        .pipe(
          map(() => {
            this.completeOnboarding(true);
          })
        )
        .subscribe();
    }
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.redirectionCount--;
      if (this.redirectionCount === 0) {
        clearInterval(interval);
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    }, 1000);
  }
}
