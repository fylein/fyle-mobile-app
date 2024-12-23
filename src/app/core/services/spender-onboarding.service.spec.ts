import { TestBed } from '@angular/core/testing';
import { SpenderOnboardingService } from './spender-onboarding.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { OnboardingStepStatus } from '../models/onboarding-step-status.model';
import { of } from 'rxjs';
import { onboardingStatusData } from '../mock-data/onboarding-status.data';
import { OnboardingWelcomeStepStatus } from '../models/onboarding-welcome-step-status.model';

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

  it('getOnboardingStatus(): should get onboarding status', (done) => {
    const onboardingResponse = onboardingStatusData;
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: onboardingResponse }));

    spenderOnboardingService.getOnboardingStatus().subscribe((res) => {
      expect(res).toEqual(onboardingResponse);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/onboarding');
      done();
    });
  });

  it('processConnnectCardsStep(): should process connect card step', (done) => {
    const onboardingRequestResponse: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: onboardingRequestResponse }));

    spenderOnboardingService.processConnectCardsStep(onboardingRequestResponse).subscribe((res) => {
      expect(res).toEqual(onboardingRequestResponse);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/onboarding/process_step_connect_cards', {
        data: onboardingRequestResponse,
      });
      done();
    });
  });

  it('processSmsOptInStep(): should process opt in step', (done) => {
    const onboardingRequestResponse: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: onboardingRequestResponse }));

    spenderOnboardingService.processSmsOptInStep(onboardingRequestResponse).subscribe((res) => {
      expect(res).toEqual(onboardingRequestResponse);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/onboarding/process_step_sms_opt_in', {
        data: onboardingRequestResponse,
      });
      done();
    });
  });

  it('processWelcomeModalStep(): should get category count', (done) => {
    const onboardingRequestResponse: OnboardingWelcomeStepStatus = {
      is_complete: true,
    };
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: onboardingRequestResponse }));

    spenderOnboardingService.processWelcomeModalStep(onboardingRequestResponse).subscribe((res) => {
      expect(res).toEqual(onboardingRequestResponse);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/onboarding/process_step_show_welcome_modal', {
        data: onboardingRequestResponse,
      });
      done();
    });
  });

  it('markWelcomeModalStepAsComplete(): should call processWelcomeModalStep with the correct data', (done) => {
    const mockData: OnboardingWelcomeStepStatus = { is_complete: true };
    spyOn(spenderOnboardingService, 'processWelcomeModalStep').and.returnValue(of(mockData));

    spenderOnboardingService.markWelcomeModalStepAsComplete().subscribe((result) => {
      expect(spenderOnboardingService.processWelcomeModalStep).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
      done();
    });
  });

  it('markConnectCardsStepAsComplete(): should call processConnectCardsStep with the correct data', (done) => {
    const mockData: OnboardingStepStatus = { is_configured: true, is_skipped: false };
    spyOn(spenderOnboardingService, 'processConnectCardsStep').and.returnValue(of(mockData));

    spenderOnboardingService.markConnectCardsStepAsComplete().subscribe((result) => {
      expect(spenderOnboardingService.processConnectCardsStep).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
      done();
    });
  });

  it('skipConnectCardsStep(): should call processConnectCardsStep with the correct data', (done) => {
    const mockData: OnboardingStepStatus = { is_configured: false, is_skipped: true };
    spyOn(spenderOnboardingService, 'processConnectCardsStep').and.returnValue(of(mockData));

    spenderOnboardingService.skipConnectCardsStep().subscribe((result) => {
      expect(spenderOnboardingService.processConnectCardsStep).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
      done();
    });
  });

  it('markSmsOptInStepAsComplete(): should call processSmsOptInStep with the correct data', (done) => {
    const mockData: OnboardingStepStatus = { is_configured: true, is_skipped: false };
    spyOn(spenderOnboardingService, 'processSmsOptInStep').and.returnValue(of(mockData));

    spenderOnboardingService.markSmsOptInStepAsComplete().subscribe((result) => {
      expect(spenderOnboardingService.processSmsOptInStep).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
      done();
    });
  });

  it('skipSmsOptInStep(): should call processSmsOptInStep with the correct data', (done) => {
    const mockData: OnboardingStepStatus = { is_configured: false, is_skipped: true };
    spyOn(spenderOnboardingService, 'processSmsOptInStep').and.returnValue(of(mockData));

    spenderOnboardingService.skipSmsOptInStep().subscribe((result) => {
      expect(spenderOnboardingService.processSmsOptInStep).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockData);
      done();
    });
  });
});
