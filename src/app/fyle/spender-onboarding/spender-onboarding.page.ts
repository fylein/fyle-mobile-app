import { Component, ViewChild } from '@angular/core';
import { finalize, forkJoin, from, map, Observable, switchMap } from 'rxjs';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OnboardingStep } from './models/onboarding-step.enum';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Router } from '@angular/router';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { SidemenuComponent } from 'src/app/shared/components/sidemenu/sidemenu.component';

@Component({
  selector: 'app-spender-onboarding',
  templateUrl: './spender-onboarding.page.html',
  styleUrls: ['./spender-onboarding.page.scss'],
})
export class SpenderOnboardingPage {
  @ViewChild('sidemenuRef') sidemenuRef: SidemenuComponent;

  isLoading = true;

  userFullName: string;

  currentStep: OnboardingStep = OnboardingStep.CONNECT_CARD;

  onlyOptInEnabled = false;

  onboardingStep: typeof OnboardingStep = OnboardingStep;

  eou: ExtendedOrgUser;

  orgSettings: OrgSettings;

  onboardingComplete = false;

  onboardingInProgress = true;

  redirectionCount = 3;

  isConnected$: Observable<boolean>;

  constructor(
    private loaderService: LoaderService,
    private orgUserService: OrgUserService,
    private spenderOnboardingService: SpenderOnboardingService,
    private orgSettingsService: OrgSettingsService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private router: Router
  ) {}

  ionViewWillEnter(): void {
    this.router.navigateByUrl('/enterprise/my_dashboard', { skipLocationChange: true });
    this.router.navigate(['/', 'enterprise', 'my_dashboard']);
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
            this.currentStep = OnboardingStep.OPT_IN;
          })
        )
        .subscribe();
    } else if (this.currentStep === OnboardingStep.OPT_IN) {
      this.onboardingInProgress = false;
      this.spenderOnboardingService
        .skipSmsOptInStep()
        .pipe(
          switchMap(() => this.spenderOnboardingService.markWelcomeModalStepAsComplete()),
          map(() => {
            this.onboardingComplete = true;
            this.setSidenavPostOnboarding();
            this.router.navigate(['/', 'enterprise', 'my_dashboard']);
          })
        )
        .subscribe();
    }
  }

  markStepAsComplete(): void {
    if (this.currentStep === OnboardingStep.CONNECT_CARD) {
      this.spenderOnboardingService
        .markConnectCardsStepAsComplete()
        .pipe(map(() => (this.currentStep = OnboardingStep.OPT_IN)))
        .subscribe();
    } else if (this.currentStep === OnboardingStep.OPT_IN) {
      this.onboardingInProgress = false;
      this.spenderOnboardingService
        .markSmsOptInStepAsComplete()
        .pipe(
          switchMap(() => this.spenderOnboardingService.markWelcomeModalStepAsComplete()),
          map(() => {
            this.onboardingComplete = true;
            this.setSidenavPostOnboarding();
            this.startCountdown();
          })
        )
        .subscribe();
    }
  }

  setSidenavPostOnboarding(): void {
    this.isConnected$
      .pipe(
        map((isOnline) => {
          if (isOnline) {
            this.sidemenuRef.showSideMenuOnline();
          } else {
            this.sidemenuRef.showSideMenuOffline();
          }
        })
      )
      .subscribe();
  }

  startCountdown(): void {
    setInterval(() => {
      if (this.redirectionCount > 0) {
        this.redirectionCount--;
      } else {
        this.router.navigateByUrl('/enterprise/my_dashboard', { skipLocationChange: true });
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    }, 1000);
  }
}
