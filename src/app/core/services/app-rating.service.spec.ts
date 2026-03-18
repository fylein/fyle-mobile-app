import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { AppRatingService } from './app-rating.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { AuthService } from './auth.service';
import { NetworkService } from './network.service';
import { OrgUserService } from './org-user.service';
import { FeatureConfigService } from './platform/v1/spender/feature-config.service';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { TrackingService } from './tracking.service';
import { AppVersionService } from './app-version.service';
import { DeviceService } from './device.service';
import { AppRatingHistory } from '../models/app-rating-history.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { FeatureConfig } from '../models/feature-config.model';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';

describe('AppRatingService', () => {
  let service: AppRatingService;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let authService: jasmine.SpyObj<AuthService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let featureConfigService: jasmine.SpyObj<FeatureConfigService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  let appVersionService: jasmine.SpyObj<AppVersionService>;
  let deviceService: jasmine.SpyObj<DeviceService>;

  let popoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;

  beforeEach(() => {
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['isSwitchedToDelegator']);
    const featureConfigServiceSpy = jasmine.createSpyObj('FeatureConfigService', [
      'getConfiguration',
      'saveConfiguration',
    ]);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseStats']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create', 'getTop']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['eventTrack']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    const appVersionServiceSpy = jasmine.createSpyObj('AppVersionService', ['getFirstMobileLoginDate']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);

    translocoServiceSpy.translate.and.callFake((key: string) => key);
    popoverControllerSpy.getTop.and.resolveTo(undefined);

    popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
    popoverSpy.present.and.resolveTo();
    popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'dismiss' }, role: undefined });
    popoverControllerSpy.create.and.resolveTo(popoverSpy);

    TestBed.configureTestingModule({
      providers: [
        AppRatingService,
        { provide: LaunchDarklyService, useValue: launchDarklyServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: FeatureConfigService, useValue: featureConfigServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
        { provide: AppVersionService, useValue: appVersionServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
      ],
    });

    service = TestBed.inject(AppRatingService);
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    featureConfigService = TestBed.inject(FeatureConfigService) as jasmine.SpyObj<FeatureConfigService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    appVersionService = TestBed.inject(AppVersionService) as jasmine.SpyObj<AppVersionService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkEligibility', () => {
    it('should return false when launch darkly flag is disabled', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(false));
      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return true when flag is enabled and all eligibility checks pass', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));

      // Mock all dependencies for runEligibilityChecks
      authService.getEou.and.resolveTo({ ou: { org_name: 'Acme Corp', created_at: new Date('2020-01-01') } } as any);
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);

      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(of({ nativePrompts: [], dismissals: [] }));
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false when flag is enabled but eligibility checks fail', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));

      // Mock all dependencies for runEligibilityChecks
      authService.getEou.and.resolveTo({ ou: { org_name: 'Acme Corp', created_at: new Date('2020-01-01') } } as any);
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);

      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(false)); // Fails here
      spyOn(service, 'getPromptHistory').and.returnValue(of({ nativePrompts: [], dismissals: [] }));
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when not connected to internet', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      authService.getEou.and.resolveTo({ ou: { org_name: 'Acme Corp', created_at: new Date('2020-01-01') } } as any);
      networkService.isOnline.and.returnValue(of(false)); // Fails here
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);
      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(of({ nativePrompts: [], dismissals: [] }));
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when switched to delegator', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      authService.getEou.and.resolveTo({ ou: { org_name: 'Acme Corp', created_at: new Date('2020-01-01') } } as any);
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(true); // Fails here
      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(of({ nativePrompts: [], dismissals: [] }));
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when not enough expenses', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      authService.getEou.and.resolveTo({ ou: { org_name: 'Acme Corp', created_at: new Date('2020-01-01') } } as any);
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);
      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(of({ nativePrompts: [], dismissals: [] }));
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(false)); // Fails here

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when org name contains fyle for', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      authService.getEou.and.resolveTo({
        ou: { org_name: 'Fyle for Acme', created_at: new Date('2020-01-01') },
      } as any); // Fails here
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);
      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(of({ nativePrompts: [], dismissals: [] }));
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when org name is missing', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      authService.getEou.and.resolveTo({ ou: { created_at: new Date('2020-01-01') } } as any); // Fails here
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);
      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(of({ nativePrompts: [], dismissals: [] }));
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when user is not old enough', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      authService.getEou.and.resolveTo({ ou: { org_name: 'Acme Corp', created_at: new Date() } } as any); // Fails here
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);
      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(of({ nativePrompts: [], dismissals: [] }));
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when native prompt cooldown is not met', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      authService.getEou.and.resolveTo({ ou: { org_name: 'Acme Corp', created_at: new Date('2020-01-01') } } as any);
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);
      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(
        of({ nativePrompts: [new Date().toISOString()], dismissals: [] }),
      ); // Fails here
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when dismissal cooldown is not met', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      authService.getEou.and.resolveTo({ ou: { org_name: 'Acme Corp', created_at: new Date('2020-01-01') } } as any);
      networkService.isOnline.and.returnValue(of(true));
      orgUserService.isSwitchedToDelegator.and.resolveTo(false);
      spyOn(service, 'isUserOldEnoughOnMobile').and.returnValue(of(true));
      spyOn(service, 'getPromptHistory').and.returnValue(
        of({ nativePrompts: [], dismissals: [new Date().toISOString()] }),
      ); // Fails here
      spyOn(service, 'hasEnoughExpenses').and.returnValue(of(true));

      service.checkEligibility().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });
  });

  describe('isUserOldEnough', () => {
    it('should return true when user was created more than 30 days ago', () => {
      const eou = { ...apiEouRes, ou: { ...apiEouRes.ou, created_at: new Date('2020-01-01') } } as ExtendedOrgUser;
      expect(service.isUserOldEnough(eou)).toBeTrue();
    });

    it('should return false when user was created less than 30 days ago', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5);
      const eou = { ...apiEouRes, ou: { ...apiEouRes.ou, created_at: recentDate } } as ExtendedOrgUser;
      expect(service.isUserOldEnough(eou)).toBeFalse();
    });

    it('should return false when user was created exactly 29 days ago', () => {
      const date = new Date();
      date.setDate(date.getDate() - 29);
      const eou = { ...apiEouRes, ou: { ...apiEouRes.ou, created_at: date } } as ExtendedOrgUser;
      expect(service.isUserOldEnough(eou)).toBeFalse();
    });

    it('should return true when user was created exactly 31 days ago', () => {
      const date = new Date();
      date.setDate(date.getDate() - 31);
      const eou = { ...apiEouRes, ou: { ...apiEouRes.ou, created_at: date } } as ExtendedOrgUser;
      expect(service.isUserOldEnough(eou)).toBeTrue();
    });

    it('should return false when created_at is null', () => {
      const eou = { ...apiEouRes, ou: { ...apiEouRes.ou, created_at: null } } as ExtendedOrgUser;
      expect(service.isUserOldEnough(eou)).toBeFalse();
    });

    it('should return false when ou is null', () => {
      const eou = { ...apiEouRes, ou: null } as ExtendedOrgUser;
      expect(service.isUserOldEnough(eou)).toBeFalse();
    });
  });

  describe('isUserOldEnoughOnMobile', () => {
    it('should return true when first mobile login was more than 30 days ago', (done) => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 45);
      deviceService.getDeviceInfo.and.returnValue(of({ operatingSystem: 'ios' } as any));
      appVersionService.getFirstMobileLoginDate.and.returnValue(of(oldDate));

      service.isUserOldEnoughOnMobile().subscribe((result) => {
        expect(result).toBeTrue();
        expect(appVersionService.getFirstMobileLoginDate).toHaveBeenCalledWith('ios');
        done();
      });
    });

    it('should return false when first mobile login was less than 30 days ago', (done) => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);
      deviceService.getDeviceInfo.and.returnValue(of({ operatingSystem: 'android' } as any));
      appVersionService.getFirstMobileLoginDate.and.returnValue(of(recentDate));

      service.isUserOldEnoughOnMobile().subscribe((result) => {
        expect(result).toBeFalse();
        expect(appVersionService.getFirstMobileLoginDate).toHaveBeenCalledWith('android');
        done();
      });
    });

    it('should return false when no mobile login date exists', (done) => {
      deviceService.getDeviceInfo.and.returnValue(of({ operatingSystem: 'ios' } as any));
      appVersionService.getFirstMobileLoginDate.and.returnValue(of(null));

      service.isUserOldEnoughOnMobile().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });
  });

  describe('hasEnoughExpenses', () => {
    it('should return false when response data is missing', (done) => {
      expensesService.getExpenseStats.and.returnValue(of({} as any));
      service.hasEnoughExpenses().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return true when expense count is >= 10', (done) => {
      expensesService.getExpenseStats.and.returnValue(of({ data: { count: 10, total_amount: 5000 } }));
      service.hasEnoughExpenses().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return true when expense count is exactly 10', (done) => {
      expensesService.getExpenseStats.and.returnValue(of({ data: { count: 10, total_amount: 1000 } }));
      service.hasEnoughExpenses().subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false when expense count is < 10', (done) => {
      expensesService.getExpenseStats.and.returnValue(of({ data: { count: 9, total_amount: 500 } }));
      service.hasEnoughExpenses().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false when expense count is 0', (done) => {
      expensesService.getExpenseStats.and.returnValue(of({ data: { count: 0, total_amount: 0 } }));
      service.hasEnoughExpenses().subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });
  });

  describe('getPromptHistory', () => {
    it('should return history from FeatureConfigService', (done) => {
      const mockHistory: AppRatingHistory = {
        nativePrompts: ['2026-01-01T00:00:00.000Z'],
        dismissals: ['2026-02-01T00:00:00.000Z'],
      };
      const mockConfig = { value: mockHistory } as FeatureConfig<AppRatingHistory>;
      featureConfigService.getConfiguration.and.returnValue(of(mockConfig));

      service.getPromptHistory().subscribe((result) => {
        expect(result).toEqual(mockHistory);
        expect(featureConfigService.getConfiguration).toHaveBeenCalledOnceWith({
          feature: 'IN_APP_RATING',
          key: 'PROMPT_HISTORY',
          is_shared: false,
        });
        done();
      });
    });

    it('should return default empty history when config value is null', (done) => {
      const mockConfig = { value: null } as FeatureConfig<AppRatingHistory>;
      featureConfigService.getConfiguration.and.returnValue(of(mockConfig));

      service.getPromptHistory().subscribe((result) => {
        expect(result).toEqual({ nativePrompts: [], dismissals: [] });
        done();
      });
    });

    it('should propagate error when FeatureConfigService fails', (done) => {
      featureConfigService.getConfiguration.and.returnValue(throwError(() => new Error('API error')));

      service.getPromptHistory().subscribe({
        error: (err) => {
          expect(err.message).toBe('API error');
          done();
        },
      });
    });
  });

  describe('isNativePromptCooldownMet', () => {
    it('should return true when nativePrompts is empty', () => {
      const history: AppRatingHistory = { nativePrompts: [], dismissals: [] };
      expect(service.isNativePromptCooldownMet(history)).toBeTrue();
    });

    it('should return true when nativePrompts is undefined', () => {
      const history = { dismissals: [] } as AppRatingHistory;
      expect(service.isNativePromptCooldownMet(history)).toBeTrue();
    });

    it('should return true when last native prompt was more than 180 days ago', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 200);
      const history: AppRatingHistory = { nativePrompts: [oldDate.toISOString()], dismissals: [] };
      expect(service.isNativePromptCooldownMet(history)).toBeTrue();
    });

    it('should return false when last native prompt was less than 180 days ago', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      const history: AppRatingHistory = { nativePrompts: [recentDate.toISOString()], dismissals: [] };
      expect(service.isNativePromptCooldownMet(history)).toBeFalse();
    });

    it('should check only the last entry when multiple native prompts exist', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 200);
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);
      const history: AppRatingHistory = {
        nativePrompts: [oldDate.toISOString(), recentDate.toISOString()],
        dismissals: [],
      };
      expect(service.isNativePromptCooldownMet(history)).toBeFalse();
    });
  });

  describe('isDismissalCooldownMet', () => {
    it('should return true when dismissals is empty', () => {
      const history: AppRatingHistory = { nativePrompts: [], dismissals: [] };
      expect(service.isDismissalCooldownMet(history)).toBeTrue();
    });

    it('should return true when dismissals is undefined', () => {
      const history = { nativePrompts: [] } as AppRatingHistory;
      expect(service.isDismissalCooldownMet(history)).toBeTrue();
    });

    it('should return true when last dismissal was more than 60 days ago', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 90);
      const history: AppRatingHistory = { nativePrompts: [], dismissals: [oldDate.toISOString()] };
      expect(service.isDismissalCooldownMet(history)).toBeTrue();
    });

    it('should return false when last dismissal was less than 60 days ago', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);
      const history: AppRatingHistory = { nativePrompts: [], dismissals: [recentDate.toISOString()] };
      expect(service.isDismissalCooldownMet(history)).toBeFalse();
    });

    it('should check only the last entry when multiple dismissals exist', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 90);
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5);
      const history: AppRatingHistory = {
        nativePrompts: [],
        dismissals: [oldDate.toISOString(), recentDate.toISOString()],
      };
      expect(service.isDismissalCooldownMet(history)).toBeFalse();
    });
  });

  describe('attemptRatingPrompt', () => {
    it('should show pre-prompt popover when eligible', fakeAsync(() => {
      spyOn(service, 'checkEligibility').and.returnValue(of(true));
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: { nativePrompts: [], dismissals: [] } } as FeatureConfig<AppRatingHistory>),
      );
      featureConfigService.saveConfiguration.and.returnValue(of(undefined));

      service.attemptRatingPrompt();
      tick();

      expect(trackingService.eventTrack).toHaveBeenCalledWith('In App Rating Eligible', {});
      expect(popoverController.create).toHaveBeenCalledTimes(1);
    }));

    it('should not show popover when not eligible', fakeAsync(() => {
      spyOn(service, 'checkEligibility').and.returnValue(of(false));

      service.attemptRatingPrompt();
      tick();

      expect(popoverController.create).not.toHaveBeenCalled();
    }));

    it('should not show popover when eligibility check errors', fakeAsync(() => {
      spyOn(service, 'checkEligibility').and.returnValue(throwError(() => new Error('fail')));

      service.attemptRatingPrompt();
      tick();

      expect(popoverController.create).not.toHaveBeenCalled();
    }));
  });

  describe('notifySaveSuccess', () => {
    it('should call attemptRatingPrompt after a delay', fakeAsync(() => {
      spyOn(service, 'attemptRatingPrompt');

      service.notifySaveSuccess();

      expect(service.attemptRatingPrompt).not.toHaveBeenCalled();

      tick(1000);

      expect(service.attemptRatingPrompt).toHaveBeenCalledTimes(1);
    }));
  });

  describe('showPrePromptPopover (via attemptRatingPrompt)', () => {
    beforeEach(() => {
      spyOn(service, 'checkEligibility').and.returnValue(of(true));
      featureConfigService.saveConfiguration.and.returnValue(of(undefined));
    });

    it('should dismiss existing popover before creating a new one', fakeAsync(() => {
      const existingPopoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['dismiss']);
      existingPopoverSpy.dismiss.and.resolveTo();
      popoverController.getTop.and.resolveTo(existingPopoverSpy);
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: { nativePrompts: [], dismissals: [] } } as FeatureConfig<AppRatingHistory>),
      );

      service.attemptRatingPrompt();
      tick();

      expect(existingPopoverSpy.dismiss).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledTimes(1);
    }));

    it('should trigger native review and record nativePrompts when user taps "Leave a rating"', fakeAsync(() => {
      const triggerSpy = spyOn<any>(service, 'triggerNativeReview').and.resolveTo();
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'rate' }, role: undefined });
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: { nativePrompts: [], dismissals: [] } } as FeatureConfig<AppRatingHistory>),
      );

      service.attemptRatingPrompt();
      tick();

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(trackingService.eventTrack).toHaveBeenCalledWith('In App Rating Accepted', {});
      expect(triggerSpy).toHaveBeenCalledTimes(1);
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledTimes(1);
      const savedValue = featureConfigService.saveConfiguration.calls.mostRecent().args[0].value as AppRatingHistory;
      expect(savedValue.nativePrompts.length).toBe(1);
      expect(savedValue.dismissals.length).toBe(0);
    }));

    it('should record dismissal when user taps "Not now"', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'dismiss' }, role: undefined });
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: { nativePrompts: [], dismissals: [] } } as FeatureConfig<AppRatingHistory>),
      );

      service.attemptRatingPrompt();
      tick();

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(trackingService.eventTrack).toHaveBeenCalledWith('In App Rating Dismissed', {});
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledTimes(1);
      const savedValue = featureConfigService.saveConfiguration.calls.mostRecent().args[0].value as AppRatingHistory;
      expect(savedValue.nativePrompts.length).toBe(0);
      expect(savedValue.dismissals.length).toBe(1);
    }));

    it('should record dismissal when popover is dismissed without data', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: undefined, role: undefined });
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: { nativePrompts: [], dismissals: [] } } as FeatureConfig<AppRatingHistory>),
      );

      service.attemptRatingPrompt();
      tick();

      expect(trackingService.eventTrack).toHaveBeenCalledWith('In App Rating Dismissed', {});
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledTimes(1);
      const savedValue = featureConfigService.saveConfiguration.calls.mostRecent().args[0].value as AppRatingHistory;
      expect(savedValue.dismissals.length).toBe(1);
    }));

    it('should track In App Rating Dismissed Outside when user taps backdrop', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: undefined, role: 'backdrop' });
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: { nativePrompts: [], dismissals: [] } } as FeatureConfig<AppRatingHistory>),
      );

      service.attemptRatingPrompt();
      tick();

      expect(trackingService.eventTrack).toHaveBeenCalledWith('In App Rating Dismissed By Tapping Outside', {
        dismissMethod: 'backdrop_tap',
      });
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledTimes(1);
      const savedValue = featureConfigService.saveConfiguration.calls.mostRecent().args[0].value as AppRatingHistory;
      expect(savedValue.dismissals.length).toBe(1);
    }));

    it('should append to existing history when recording interaction', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'dismiss' }, role: undefined });
      const existingHistory: AppRatingHistory = {
        nativePrompts: ['2025-06-01T00:00:00.000Z'],
        dismissals: ['2025-08-01T00:00:00.000Z'],
      };
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: existingHistory } as FeatureConfig<AppRatingHistory>),
      );

      service.attemptRatingPrompt();
      tick();

      const savedValue = featureConfigService.saveConfiguration.calls.mostRecent().args[0].value as AppRatingHistory;
      expect(savedValue.nativePrompts.length).toBe(1);
      expect(savedValue.dismissals.length).toBe(2);
      expect(savedValue.nativePrompts[0]).toBe('2025-06-01T00:00:00.000Z');
    }));

    it('should create popover with correct component and props', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'dismiss' }, role: undefined });
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: { nativePrompts: [], dismissals: [] } } as FeatureConfig<AppRatingHistory>),
      );
      featureConfigService.saveConfiguration.and.returnValue(of(undefined));

      service.attemptRatingPrompt();
      tick();

      const createCall = popoverController.create.calls.mostRecent().args[0];
      expect(createCall.component).toBe(PopupAlertComponent);
      expect(createCall.cssClass).toBe('pop-up-in-center');
      expect(createCall.componentProps.primaryCta.action).toBe('rate');
      expect(createCall.componentProps.secondaryCta.action).toBe('dismiss');
    }));
  });

  describe('recordInteraction error handling', () => {
    it('should not throw when saveConfiguration fails', fakeAsync(() => {
      spyOn(service, 'checkEligibility').and.returnValue(of(true));
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'dismiss' }, role: undefined });
      featureConfigService.getConfiguration.and.returnValue(
        of({ value: { nativePrompts: [], dismissals: [] } } as FeatureConfig<AppRatingHistory>),
      );
      featureConfigService.saveConfiguration.and.returnValue(throwError(() => new Error('save failed')));

      expect(() => {
        service.attemptRatingPrompt();
        tick();
      }).not.toThrow();
    }));
  });
});
