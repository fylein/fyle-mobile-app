import { Component } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OnboardingStep } from './models/onboarding-step.enum';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spender-onboarding',
  templateUrl: './spender-onboarding.page.html',
  styleUrls: ['./spender-onboarding.page.scss'],
})
export class SpenderOnboardingPage {
  isLoading = true;

  userFullName: string;

  currentStep: OnboardingStep;

  onboardingStep: typeof OnboardingStep = OnboardingStep;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private spenderOnboardingService: SpenderOnboardingService,
    private orgSettingsService: OrgSettingsService,
    private router: Router
  ) {}

  ionViewWillEnter(): void {
    this.isLoading = true;
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.orgUserService.getCurrent()),
        map((eou: ExtendedOrgUser) => {
          this.userFullName = eou.us.full_name;
          this.isLoading = false;
          this.loaderService.hideLoader();
        })
      )
      .subscribe();

    const isRtfEnabled = orgSettings.visa_enrollment_settings.enabled && mastercard_enrollment_settings.enabled;
    const isAmexFeedEnabled = orgSettings.amex_feed_enrollment_settings.enabled;
    this.spenderOnboardingService.getOnboardingStatus().subscribe((status) => {
      if (isAmexFeedEnabled && !isRtfEnabled) {
        this.currentStep === OnboardingStep.OPT_IN;
      } else if (isRtfEnabled) {
        // TODO: Add checks for status in connect card and opt in component prs
      } else {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  skipOnboardingStep(): void {
    if (this.currentStep === OnboardingStep.CONNECT_CARD) {
      this.spenderOnboardingService.skipConnectCardsStep();
    }
    if (this.currentStep === OnboardingStep.OPT_IN) {
      this.spenderOnboardingService.skipSmsOptInStep();
    }
  }
}
