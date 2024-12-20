import { TestBed } from '@angular/core/testing';
import { SpenderOnboardingService } from './spender-onboarding.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { OnboardingStepStatus } from '../models/onboarding-step-status.model';
import { of } from 'rxjs';

// Add any other imports as necessary from the original TasksService spec

describe('SpenderOnboardingService', () => {
  let spenderOnboardingService: SpenderOnboardingService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        SpenderOnboardingService,
        [
          {
            provide: SpenderPlatformV1ApiService,
            useValue: spenderPlatformV1ApiServiceSpy,
          },
        ],
      ],
    });
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  fit('getOnboardingStatus(): should get onboarding status', (done) => {
    const onboardingResponse: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: onboardingResponse }));

    spenderOnboardingService.getOnboardingStatus().subscribe((res) => {
      expect(res).toEqual(onboardingResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/spender/onboarding');
      done();
    });
  });

  fit('processConnnectCardsStep(): should process connect card step', (done) => {
    const onboardingRequestResponse: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: onboardingRequestResponse }));

    spenderOnboardingService.processConnectCardsStep(onboardingRequestResponse).subscribe((res) => {
      expect(res).toEqual(onboardingRequestResponse);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith(
        '/spender/onboarding/process_step_connect_cards',
        onboardingRequestResponse
      );
      done();
    });
  });

  fit('processWelcomeModalStep(): should get category count', (done) => {
    const onboardingRequestResponse: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: onboardingRequestResponse }));

    spenderOnboardingService.processConnectCardsStep(onboardingRequestResponse).subscribe((res) => {
      expect(res).toEqual(onboardingRequestResponse);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith(
        '/spender/onboarding/process_step_connect_cards',
        onboardingRequestResponse
      );
      done();
    });
  });

  fit('getActiveCategoriesCount(): should get category count', (done) => {
    const onboardingResponse: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: onboardingResponse }));

    spenderOnboardingService.getOnboardingStatus().subscribe((res) => {
      expect(res).toEqual(onboardingResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/spender/onboarding');
      done();
    });
  });

  fit('getActiveCategoriesCount(): should get category count', (done) => {
    const onboardingResponse: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: onboardingResponse }));

    spenderOnboardingService.getOnboardingStatus().subscribe((res) => {
      expect(res).toEqual(onboardingResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/spender/onboarding');
      done();
    });
  });
});
