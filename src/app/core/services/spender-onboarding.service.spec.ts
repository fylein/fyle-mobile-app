import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SpenderOnboardingService } from './spender-onboarding.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { OnboardingStepStatus } from '../models/onboarding-step-status.model';
import { of } from 'rxjs';
import { onboardingStatusData } from '../mock-data/onboarding-status.data';
import { OnboardingWelcomeStepStatus } from '../models/onboarding-welcome-step-status.model';
import { UtilityService } from './utility.service';
import { OrgSettings } from '../models/org-settings.model';
import { OrgSettingsService } from './org-settings.service';
import { AuthService } from './auth.service';
import { orgSettingsCardsDisabled, orgSettingsData } from '../test-data/org-settings.service.spec.data';
import { OnboardingState } from '../models/onboarding-state.enum';
import { orgSettingsCCCDisabled3 } from '../mock-data/org-settings.data';
import { extendedOrgUserResponse } from '../test-data/tasks.service.spec.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';

describe('SpenderOnboardingService', () => {
  let spenderOnboardingService: SpenderOnboardingService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['isUserFromINCluster']);
    TestBed.configureTestingModule({
      providers: [
        SpenderOnboardingService,
        [
          {
            provide: SpenderPlatformV1ApiService,
            useValue: spenderPlatformV1ApiServiceSpy,
          },
          {
            provide: OrgSettingsService,
            useValue: orgSettingsServiceSpy,
          },
          {
            provide: AuthService,
            useValue: authServiceSpy,
          },
          {
            provide: UtilityService,
            useValue: utilityServiceSpy,
          },
        ],
      ],
    });
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService);
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

  it('checkForRedirectionToOnboarding(): should return true when conditions are met', async () => {
    spyOn(spenderOnboardingService, 'getOnboardingStatus').and.returnValue(of(onboardingStatusData));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    authService.getEou.and.returnValue(new Promise((resolve) => resolve(apiEouRes)));
    utilityService.isUserFromINCluster.and.resolveTo(false);
    const result = await spenderOnboardingService.checkForRedirectionToOnboarding().toPromise();
    expect(result).toBeTrue();
  });

  describe('checkCCCEnabled(): ', () => {
    it('should return true when corporate credit card settings are allowed and enabled', () => {
      const orgSettings = orgSettingsData;

      //@ts-ignore
      expect(spenderOnboardingService.checkCCCEnabled(orgSettings)).toBeTrue();
    });

    it('should return false when corporate credit card settings are not allowed or enabled', () => {
      const orgSettings = orgSettingsCCCDisabled3;

      //@ts-ignore
      expect(spenderOnboardingService.checkCCCEnabled(orgSettings)).toBeFalse();
    });
  });

  describe('checkCardFeedEnabled(): ', () => {
    it('should return true when any card feed settings are allowed and enabled', () => {
      const orgSettings = orgSettingsData;

      //@ts-ignore
      expect(spenderOnboardingService.checkCardFeedEnabled(orgSettings)).toBeTrue();
    });

    it('should return false when no card feed settings are allowed and enabled', () => {
      const orgSettings = orgSettingsCardsDisabled;

      //@ts-ignore
      expect(spenderOnboardingService.checkCardFeedEnabled(orgSettings)).toBeFalse();
    });
  });

  describe('isRestrictedOrg(): ', () => {
    it('should return true for restricted org id', () => {
      const orgSettings = { ...orgSettingsData, org_id: 'orgp5onHZThs' };
      //@ts-ignore
      expect(spenderOnboardingService.isRestrictedOrg(orgSettings, false)).toBeTrue();
    });

    it('should return true when user is from IN cluster', () => {
      const orgSettings = orgSettingsData;
      //@ts-ignore
      expect(spenderOnboardingService.isRestrictedOrg(orgSettings, true)).toBeTrue();
    });

    it('should return false for unrestricted org id and user not from IN cluster', () => {
      const orgSettings = orgSettingsData;
      //@ts-ignore
      expect(spenderOnboardingService.isRestrictedOrg(orgSettings, false)).toBeFalse();
    });
  });

  describe('shouldProceedToOnboarding(): ', () => {
    it('should return true when all conditions are met', () => {
      expect(
        //@ts-ignore
        spenderOnboardingService.shouldProceedToOnboarding('USD', false, true, { state: OnboardingState.YET_TO_START })
      ).toBeTrue();
    });

    it('should return false when currency is not USD', () => {
      expect(
        //@ts-ignore
        spenderOnboardingService.shouldProceedToOnboarding('EUR', false, true, { state: OnboardingState.YET_TO_START })
      ).toBeFalse();
    });

    it('should return false when org is restricted', () => {
      expect(
        //@ts-ignore
        spenderOnboardingService.shouldProceedToOnboarding('USD', true, true, { state: OnboardingState.YET_TO_START })
      ).toBeFalse();
    });

    it('should return false when cards are not enabled', () => {
      expect(
        //@ts-ignore
        spenderOnboardingService.shouldProceedToOnboarding('USD', false, false, { state: OnboardingState.YET_TO_START })
      ).toBeFalse();
    });

    it('should return false when onboarding is completed', () => {
      expect(
        //@ts-ignore
        spenderOnboardingService.shouldProceedToOnboarding('USD', false, true, { state: 'COMPLETED' })
      ).toBeFalse();
    });
  });
});
