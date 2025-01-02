import { Component } from '@angular/core';
import { forkJoin, from, map, switchMap } from 'rxjs';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OnboardingStep } from './models/onboarding-step.enum';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Router } from '@angular/router';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';

@Component({
  selector: 'app-spender-onboarding',
  templateUrl: './spender-onboarding.page.html',
  styleUrls: ['./spender-onboarding.page.scss'],
})
export class SpenderOnboardingPage {
  isLoading = true;

  userFullName: string;

  currentStep: OnboardingStep = OnboardingStep.CONNECT_CARD;

  onlyOptInEnabled = false;

  onboardingStep: typeof OnboardingStep = OnboardingStep;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private spenderOnboardingService: SpenderOnboardingService,
    private orgSettingsService: OrgSettingsService,
    private router: Router,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService
  ) {}

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
          this.userFullName = eou.us.full_name;
          const isRtfEnabled =
            orgSettings.visa_enrollment_settings.enabled && orgSettings.mastercard_enrollment_settings.enabled;
          const isAmexFeedEnabled = orgSettings.amex_feed_enrollment_settings.enabled;
          const rtfCards = corporateCards.filter((card) => card.is_visa_enrolled || card.is_mastercard_enrolled);
          if (isAmexFeedEnabled && !isRtfEnabled) {
            this.currentStep = OnboardingStep.OPT_IN;
            this.onlyOptInEnabled = true;
          } else if (isRtfEnabled) {
            // If Connect Card was skipped earlier or Cards are already enrolled, then go to OPT_IN step
            if (
              onboardingStatus.step_connect_cards_is_skipped ||
              onboardingStatus.step_connect_cards_is_configured ||
              rtfCards.length > 0
            ) {
              this.currentStep = OnboardingStep.OPT_IN;
              this.onlyOptInEnabled = true;
            } else {
              this.currentStep = OnboardingStep.CONNECT_CARD;
            }
          }
          this.isLoading = false;
          this.loaderService.hideLoader();
        })
      )
      .subscribe();
  }

  skipOnboardingStep(): void {
    if (this.currentStep === OnboardingStep.CONNECT_CARD) {
      this.spenderOnboardingService.skipConnectCardsStep();
    }
    if (this.currentStep === OnboardingStep.OPT_IN) {
      this.spenderOnboardingService.skipSmsOptInStep();
    }
  }

  markStepAsComplete(): void {
    if (this.currentStep === OnboardingStep.CONNECT_CARD) {
      this.spenderOnboardingService.markConnectCardsStepAsComplete();
    }
    if (this.currentStep === OnboardingStep.OPT_IN) {
      this.spenderOnboardingService.markSmsOptInStepAsComplete();
    }
  }
}
