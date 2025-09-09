import { Component, inject } from '@angular/core';
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
import { TrackingService } from 'src/app/core/services/tracking.service';
import { OnboardingStatus } from 'src/app/core/models/onboarding-status.model';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { IonicModule } from '@ionic/angular';
import { FyMenuIconComponent } from '../../shared/components/fy-menu-icon/fy-menu-icon.component';
import { NgClass } from '@angular/common';
import { SpenderOnboardingConnectCardStepComponent } from './spender-onboarding-connect-card-step/spender-onboarding-connect-card-step.component';
import { SpenderOnboardingOptInStepComponent } from './spender-onboarding-opt-in-step/spender-onboarding-opt-in-step.component';

@Component({
    selector: 'app-spender-onboarding',
    templateUrl: './spender-onboarding.page.html',
    styleUrls: ['./spender-onboarding.page.scss'],
    imports: [
        IonicModule,
        FyMenuIconComponent,
        NgClass,
        SpenderOnboardingConnectCardStepComponent,
        SpenderOnboardingOptInStepComponent,
    ],
})
export class SpenderOnboardingPage {
  private loaderService = inject(LoaderService);

  private orgUserService = inject(OrgUserService);

  private spenderOnboardingService = inject(SpenderOnboardingService);

  private orgSettingsService = inject(OrgSettingsService);

  private corporateCreditCardExpenseService = inject(CorporateCreditCardExpenseService);

  private router = inject(Router);

  private trackingService = inject(TrackingService);

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

  areCardsEnrolled = false;

  isMobileVerified(eou: ExtendedOrgUser): boolean {
    return !!(eou.ou.mobile && eou.ou.mobile_verified);
  }

  setPostOnboardingScreen(isComplete?: boolean): void {
    this.spenderOnboardingService.setOnboardingStatusEvent();
    this.corporateCreditCardExpenseService.clearCache().subscribe();
    if (isComplete) {
      this.onboardingComplete = true;
      this.startCountdown();
    } else {
      this.trackingService.eventTrack('Redirect To Dashboard After Onboarding Skip');
      this.router.navigate(['/', 'enterprise', 'my_dashboard']);
    }
  }

  completeOnboarding(isComplete?: boolean): Observable<void> {
    this.onboardingInProgress = false;
    return this.spenderOnboardingService.markWelcomeModalStepAsComplete().pipe(
      map(() => {
        this.setPostOnboardingScreen(isComplete);
      }),
    );
  }

  setUpRtfSteps(onboardingStatus: OnboardingStatus, rtfCards: PlatformCorporateCard[]): void {
    if (rtfCards.length > 0) {
      this.trackingService.eventTrack('Skip Connect Cards Onboarding Step - Cards Already Enrolled', {
        numberOfEnrolledCards: rtfCards.length,
      });
      this.areCardsEnrolled = true;
      this.currentStep = OnboardingStep.OPT_IN;
      this.showOneStep = true;
      this.spenderOnboardingService.skipConnectCardsStep().subscribe();
    } else if (onboardingStatus.step_connect_cards_is_skipped || onboardingStatus.step_connect_cards_is_configured) {
      this.currentStep = OnboardingStep.OPT_IN;
      if (onboardingStatus.step_connect_cards_is_configured) {
        this.showOneStep = true;
      }
    } else {
      this.currentStep = OnboardingStep.CONNECT_CARD;
      if (this.isMobileVerified(this.eou)) {
        this.trackingService.eventTrack('Skip Sms Opt In Onboarding Step - Mobile Already Verified');
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
          ]),
        ),
        map(([eou, orgSettings, onboardingStatus, corporateCards]) => {
          this.eou = eou;
          this.userFullName = eou.us.full_name;
          this.orgSettings = orgSettings;
          const isRtfEnabled =
            orgSettings.visa_enrollment_settings.enabled || orgSettings.mastercard_enrollment_settings.enabled;
          const onlyAmexEnabled = orgSettings.amex_feed_enrollment_settings.enabled && !isRtfEnabled;
          const rtfCards = corporateCards.filter((card) => card.is_visa_enrolled || card.is_mastercard_enrolled);
          if (this.isMobileVerified(this.eou) && (onlyAmexEnabled || rtfCards.length > 0)) {
            this.trackingService.eventTrack('Redirect To Dashboard From Onboarding As No Steps To Show');
            this.completeOnboarding().subscribe();
          } else if (onlyAmexEnabled) {
            this.currentStep = OnboardingStep.OPT_IN;
            this.showOneStep = true;
          } else if (isRtfEnabled) {
            // If Connect Card was skipped earlier or Cards are already enrolled, then go to OPT_IN step
            this.setUpRtfSteps(onboardingStatus, rtfCards);
          }
          this.trackingService.eventTrack('Spender Onboarding', { numberOfEnrollableCards: rtfCards.length });
        }),
        finalize(() => {
          this.isLoading = false;
          return from(this.loaderService.hideLoader());
        }),
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
              this.completeOnboarding().subscribe();
            } else {
              this.currentStep = OnboardingStep.OPT_IN;
            }
          }),
        )
        .subscribe();
    } else if (this.currentStep === OnboardingStep.OPT_IN) {
      this.onboardingInProgress = false;
      this.spenderOnboardingService
        .skipSmsOptInStep()
        .pipe(
          map(() => {
            this.trackingService.eventTrack('Sms Opt In Onboarding Step - Skipped');
          }),
          switchMap(() => this.completeOnboarding()),
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
              return this.completeOnboarding(true).subscribe();
            } else {
              this.currentStep = OnboardingStep.OPT_IN;
            }
          }),
        )
        .subscribe();
    } else if (this.currentStep === OnboardingStep.OPT_IN) {
      this.onboardingInProgress = false;
      this.spenderOnboardingService
        .markSmsOptInStepAsComplete()
        .pipe(switchMap(() => this.completeOnboarding(true)))
        .subscribe();
    }
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.redirectionCount--;
      if (this.redirectionCount === 0) {
        clearInterval(interval);
        this.trackingService.eventTrack('Redirect To Dashboard After Onboarding Success');
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    }, 1000);
  }
}
