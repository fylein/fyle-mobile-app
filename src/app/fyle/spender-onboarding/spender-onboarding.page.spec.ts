import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SpenderOnboardingPage } from './spender-onboarding.page';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OnboardingStep } from './models/onboarding-step.enum';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { onboardingStatusData } from 'src/app/core/mock-data/onboarding-status.data';
import { extendedOrgUserResponse } from 'src/app/core/test-data/tasks.service.spec.data';
import { OnboardingStepStatus } from 'src/app/core/models/onboarding-step-status.model';
import { orgSettingsWoTaxAndRtf } from 'src/app/core/mock-data/org-settings.data';
import { statementUploadedCard } from 'src/app/core/mock-data/platform-corporate-card.data';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { orgSettingsCardsDisabled } from 'src/app/core/test-data/org-settings.service.spec.data';

describe('SpenderOnboardingPage', () => {
  let component: SpenderOnboardingPage;
  let fixture: ComponentFixture<SpenderOnboardingPage>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let spenderOnboardingService: jasmine.SpyObj<SpenderOnboardingService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(async () => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['getCurrent']);
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'getOnboardingStatus',
      'skipConnectCardsStep',
      'markConnectCardsStepAsComplete',
      'skipSmsOptInStep',
      'markSmsOptInStepAsComplete',
      'markWelcomeModalStepAsComplete',
      'setOnboardingStatusEvent',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
      'clearCache',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['eventTrack']);

    await TestBed.configureTestingModule({
      declarations: [SpenderOnboardingPage],
      providers: [
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: SpenderOnboardingService, useValue: spenderOnboardingServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: CorporateCreditCardExpenseService, useValue: corporateCreditCardExpenseServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpenderOnboardingPage);
    component = fixture.componentInstance;

    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService) as jasmine.SpyObj<SpenderOnboardingService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    spenderOnboardingService.markWelcomeModalStepAsComplete.and.returnValue(of({ is_complete: true }));
    corporateCreditCardExpenseService.clearCache.and.returnValue(of(null));
    spyOn(component, 'completeOnboarding').and.returnValue(of()).and.callThrough();
  });

  describe('ionViewWillEnter(): ', () => {
    it('should show loader and fetch onboarding data on ionViewWillEnter', (done) => {
      loaderService.showLoader.and.resolveTo();
      orgUserService.getCurrent.and.returnValue(of(extendedOrgUserResponse));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      spenderOnboardingService.getOnboardingStatus.and.returnValue(of(onboardingStatusData));
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));

      component.ionViewWillEnter();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(component.userFullName).toBe('Aiyush');
        expect(component.currentStep).toBe(OnboardingStep.CONNECT_CARD);
        expect(component.isLoading).toBeFalse();
        expect(loaderService.hideLoader).toHaveBeenCalled();
        done();
      });
    });

    it('should go to Opt in step when RTF is disabled', (done) => {
      loaderService.showLoader.and.resolveTo();
      orgUserService.getCurrent.and.returnValue(of(apiEouRes));
      orgSettingsService.get.and.returnValue(of(orgSettingsWoTaxAndRtf));
      spenderOnboardingService.getOnboardingStatus.and.returnValue(of(onboardingStatusData));
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([statementUploadedCard]));

      component.ionViewWillEnter();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(component.userFullName).toBe('Abhishek Jain');
        expect(component.currentStep).toBe(OnboardingStep.OPT_IN);
        expect(component.isLoading).toBeFalse();
        done();
      });
    });

    it('should go to Opt in step when connect card is skipped', (done) => {
      loaderService.showLoader.and.resolveTo();
      orgUserService.getCurrent.and.returnValue(of(extendedOrgUserResponse));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      spenderOnboardingService.getOnboardingStatus.and.returnValue(
        of({ ...onboardingStatusData, step_connect_cards_is_skipped: true })
      );
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([statementUploadedCard]));

      component.ionViewWillEnter();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(component.userFullName).toBe('Aiyush');
        expect(component.currentStep).toBe(OnboardingStep.OPT_IN);
        expect(component.isLoading).toBeFalse();
        done();
      });
    });

    it('should skip connect card step if RTF cards are enrolled', (done) => {
      const onboardingRequestResponse: OnboardingStepStatus = {
        is_configured: false,
        is_skipped: true,
      };

      loaderService.showLoader.and.resolveTo();
      orgUserService.getCurrent.and.returnValue(of(apiEouRes));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      spenderOnboardingService.getOnboardingStatus.and.returnValue(
        of({ ...onboardingStatusData, step_connect_cards_is_skipped: false })
      );
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(
        of([{ ...statementUploadedCard, is_mastercard_enrolled: true }])
      );
      spenderOnboardingService.skipConnectCardsStep.and.returnValue(of(onboardingRequestResponse));

      component.ionViewWillEnter();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(spenderOnboardingService.skipConnectCardsStep).toHaveBeenCalledTimes(1);
        expect(component.showOneStep).toBeTrue();
        expect(component.isLoading).toBeFalse();
        done();
      });
    });
  });

  it('goBackToConnectCard(): should set currentStep to OnboardingStep.CONNECT_CARD when goBackToConnectCard is called', () => {
    component.goBackToConnectCard();

    expect(component.currentStep).toBe(OnboardingStep.CONNECT_CARD);
  });

  describe('skipOnboardingStep(): ', () => {
    it('should set onboarding as complete if mobile number is verified before navigating to opt in', fakeAsync(() => {
      component.currentStep = OnboardingStep.CONNECT_CARD;
      fixture.detectChanges();

      const onboardingRequestResponse: OnboardingStepStatus = {
        is_configured: false,
        is_skipped: true,
      };
      const welcomeModalCompletionResponse = { is_complete: true };

      spenderOnboardingService.skipConnectCardsStep.and.returnValue(of(onboardingRequestResponse));
      spenderOnboardingService.markWelcomeModalStepAsComplete.and.returnValue(of(welcomeModalCompletionResponse));
      spyOn(component, 'isMobileVerified').and.returnValue(true);
      tick();

      component.skipOnboardingStep();
      tick();

      expect(spenderOnboardingService.skipConnectCardsStep).toHaveBeenCalledTimes(1);
    }));

    it('should move from Opt in to connect card step if mobile number is not verified', fakeAsync(() => {
      component.currentStep = OnboardingStep.CONNECT_CARD;
      component.eou = apiEouRes;
      fixture.detectChanges();

      const onboardingRequestResponse: OnboardingStepStatus = {
        is_configured: false,
        is_skipped: true,
      };

      spenderOnboardingService.skipConnectCardsStep.and.returnValue(of(onboardingRequestResponse));
      tick();

      component.skipOnboardingStep();
      tick();

      expect(spenderOnboardingService.skipConnectCardsStep).toHaveBeenCalledTimes(1);
      expect(component.currentStep).toEqual(OnboardingStep.OPT_IN);
    }));

    it('should skip the opt-in onboarding step and mark welcome modal as complete', fakeAsync(() => {
      const onboardingRequestResponse: OnboardingStepStatus = {
        is_configured: false,
        is_skipped: true,
      };
      const welcomeModalCompletionResponse = { is_complete: true };

      component.currentStep = OnboardingStep.OPT_IN;
      component.onboardingInProgress = true;

      spenderOnboardingService.skipSmsOptInStep.and.returnValue(of(onboardingRequestResponse));

      component.skipOnboardingStep();
      tick();

      expect(component.completeOnboarding).toHaveBeenCalledTimes(1);
      expect(spenderOnboardingService.skipSmsOptInStep).toHaveBeenCalledTimes(1);
      expect(component.onboardingInProgress).toBeFalse();
    }));
  });

  describe('markStepAsComplete(): ', () => {
    beforeEach(() => {
      component.eou = apiEouRes;
    });

    it('should mark the current step as complete - Connect Card', fakeAsync(() => {
      component.currentStep = OnboardingStep.CONNECT_CARD;
      const onboardingRequestResponse: OnboardingStepStatus = {
        is_configured: true,
        is_skipped: false,
      };
      spenderOnboardingService.markConnectCardsStepAsComplete.and.returnValue(of(onboardingRequestResponse));
      tick();
      component.markStepAsComplete();
      tick();
      expect(spenderOnboardingService.markConnectCardsStepAsComplete).toHaveBeenCalled();
    }));

    it('should mark the current step as complete - Opt in', fakeAsync(() => {
      const onboardingRequestResponse: OnboardingStepStatus = {
        is_configured: true,
        is_skipped: false,
      };
      spenderOnboardingService.markSmsOptInStepAsComplete.and.returnValue(of(onboardingRequestResponse));
      spenderOnboardingService.markWelcomeModalStepAsComplete.and.returnValue(of({ is_complete: true }));
      component.currentStep = OnboardingStep.OPT_IN;
      spyOn(component, 'startCountdown');
      tick();
      component.markStepAsComplete();
      tick();
      expect(spenderOnboardingService.markSmsOptInStepAsComplete).toHaveBeenCalled();
    }));
  });

  describe('startCountdown(): ', () => {
    it('should decrement redirectionCount and navigate to the dashboard when it reaches zero', fakeAsync(() => {
      spyOn(window, 'setInterval').and.callThrough();
      spyOn(window, 'clearInterval').and.callThrough();

      component.redirectionCount = 3;

      component.startCountdown();

      tick(1000);
      expect(component.redirectionCount).toBe(2);

      tick(1000);
      expect(component.redirectionCount).toBe(1);

      tick(1000);
      expect(component.redirectionCount).toBe(0);
      expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'my_dashboard']);
    }));
  });

  describe('setPostOnboardingScreen(): ', () => {
    it('should set onboarding status and start countdown when isComplete is true', () => {
      spyOn(component, 'startCountdown');
      spenderOnboardingService.setOnboardingStatusEvent.and.returnValue();

      component.setPostOnboardingScreen(true);

      expect(spenderOnboardingService.setOnboardingStatusEvent).toHaveBeenCalledTimes(1);
      expect(component.onboardingComplete).toBeTrue();
      expect(component.startCountdown).toHaveBeenCalledTimes(1);
    });

    it('should set onboarding status and navigate to my_dashboard when isComplete is false', () => {
      spenderOnboardingService.setOnboardingStatusEvent.and.returnValue();

      component.setPostOnboardingScreen(false);

      expect(spenderOnboardingService.setOnboardingStatusEvent).toHaveBeenCalledTimes(1);
      expect(component.onboardingComplete).toBeFalse();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
    });
  });

  describe('completeOnboarding(): ', () => {
    it('should mark welcome modal step as complete and set post onboarding screen when isComplete is true', (done) => {
      const welcomeModalCompletionResponse = { is_complete: true };

      spyOn(component, 'setPostOnboardingScreen');
      spenderOnboardingService.markWelcomeModalStepAsComplete.and.returnValue(of(welcomeModalCompletionResponse));

      component.completeOnboarding(true).subscribe(() => {
        expect(spenderOnboardingService.markWelcomeModalStepAsComplete).toHaveBeenCalledTimes(1);
        expect(component.onboardingInProgress).toBeFalse();
        expect(component.setPostOnboardingScreen).toHaveBeenCalledOnceWith(true);
        done();
      });
    });

    it('should mark welcome modal step as complete and set post onboarding screen when isComplete is false', (done) => {
      const welcomeModalCompletionResponse = { is_complete: true };

      spyOn(component, 'setPostOnboardingScreen');
      spenderOnboardingService.markWelcomeModalStepAsComplete.and.returnValue(of(welcomeModalCompletionResponse));

      component.completeOnboarding(false).subscribe(() => {
        expect(spenderOnboardingService.markWelcomeModalStepAsComplete).toHaveBeenCalledTimes(1);
        expect(component.onboardingInProgress).toBeFalse();
        expect(component.setPostOnboardingScreen).toHaveBeenCalledOnceWith(false);
        done();
      });
    });
  });
});
