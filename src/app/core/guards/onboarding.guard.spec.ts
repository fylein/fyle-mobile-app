import { ActivatedRoute, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { SpenderOnboardingService } from '../services/spender-onboarding.service';
import { OnboardingGuard } from './onboarding.guard';
import { Observable, of } from 'rxjs';
import { LoaderService } from '../services/loader.service';

describe('OnboardingGuard', () => {
  let guard: OnboardingGuard;
  let router: jasmine.SpyObj<Router>;
  let spenderOnboardingService: jasmine.SpyObj<SpenderOnboardingService>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(() => {
    const spenderOnboardingServiceSpy = jasmine.createSpyObj('SpenderOnboardingService', [
      'checkForRedirectionToOnboarding',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SpenderOnboardingService,
          useValue: spenderOnboardingServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
      ],
    });
    guard = TestBed.inject(OnboardingGuard);
    spenderOnboardingService = TestBed.inject(SpenderOnboardingService) as jasmine.SpyObj<SpenderOnboardingService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    loaderService.showLoader.and.resolveTo();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate(): ', () => {
    it('should allow activation if checkForRedirectionToOnboarding returns false', (done) => {
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));

      const canActivate = guard.canActivate() as Observable<boolean>;
      canActivate.subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should prevent activation if checkForRedirectionToOnboarding returns true', (done) => {
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(true));

      const canActivate = guard.canActivate() as Observable<boolean>;
      canActivate.subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should call checkForRedirectionToOnboarding exactly once', (done) => {
      // Arrange
      spenderOnboardingService.checkForRedirectionToOnboarding.and.returnValue(of(false));

      const canActivate = guard.canActivate() as Observable<boolean>;
      // Act
      canActivate.subscribe(() => {
        expect(spenderOnboardingService.checkForRedirectionToOnboarding).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
