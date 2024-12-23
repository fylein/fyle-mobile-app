import { ComponentFixture, TestBed } from '@angular/core/testing';
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

describe('SpenderOnboardingPage', () => {
  let component: SpenderOnboardingPage;
  let fixture: ComponentFixture<SpenderOnboardingPage>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let spenderOnboardingService: jasmine.SpyObj<SpenderOnboardingService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['getCurrent']);
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'getOnboardingStatus',
      'skipConnectCardsStep',
      'markConnectCardsStepAsComplete',
      'skipSmsOptInStep',
      'markSmsOptInStepAsComplete',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [SpenderOnboardingPage],
      providers: [
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: SpenderOnboardingService, useValue: spenderOnboardingServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: CorporateCreditCardExpenseService, useValue: corporateCreditCardExpenseServiceSpy },
        { provide: Router, useValue: routerSpy },
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
  });

  it('ionViewWillEnter(): should show loader and fetch onboarding data on ionViewWillEnter', (done) => {
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

  it('skipOnboardingStep(): should skip the current onboarding step', () => {
    component.currentStep = OnboardingStep.CONNECT_CARD;
    component.skipOnboardingStep();
    expect(spenderOnboardingService.skipConnectCardsStep).toHaveBeenCalled();

    component.currentStep = OnboardingStep.OPT_IN;
    component.skipOnboardingStep();
    expect(spenderOnboardingService.skipSmsOptInStep).toHaveBeenCalled();
  });

  it('markStepAsComplete(): should mark the current step as complete', () => {
    component.currentStep = OnboardingStep.CONNECT_CARD;
    component.markStepAsComplete();
    expect(spenderOnboardingService.markConnectCardsStepAsComplete).toHaveBeenCalled();

    component.currentStep = OnboardingStep.OPT_IN;
    component.markStepAsComplete();
    expect(spenderOnboardingService.markSmsOptInStepAsComplete).toHaveBeenCalled();
  });
});
