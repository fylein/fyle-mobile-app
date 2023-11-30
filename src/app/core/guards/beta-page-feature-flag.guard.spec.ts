import { ActivatedRoute, Router } from '@angular/router';
import { OrgSettingsService } from '../services/org-settings.service';
import { BetaPageFeatureFlagGuard } from './beta-page-feature-flag.guard';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { routerStateSnapshotData } from '../mock-data/router-state-snapshot.data';

describe('BetaPageFeatureFlagGuard', () => {
  let guard: BetaPageFeatureFlagGuard;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['isBetaPageEnabledForPath']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              routeConfig: {
                path: 'my_view_report',
              },
              data: {
                url: '/enterprise/my_view_report',
                root: null,
              },
            },
          },
        },
      ],
    });
    guard = TestBed.inject(BetaPageFeatureFlagGuard);
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate(): ', () => {
    it('Should navigate to the beta page if the feature flag is enabled', (done) => {
      orgSettingsService.isBetaPageEnabledForPath.and.returnValue(of(true));
      const canActivate = guard.canActivate(activatedRoute.snapshot, routerStateSnapshotData) as Observable<boolean>;
      canActivate.subscribe((res) => {
        expect(orgSettingsService.isBetaPageEnabledForPath).toHaveBeenCalledTimes(1);
        expect(res).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'my_view_report_beta', {}]);
        done();
      });
    });

    it('Should navigate to the correct page if the feature flag is disabled', (done) => {
      orgSettingsService.isBetaPageEnabledForPath.and.returnValue(of(false));
      const canActivate = guard.canActivate(activatedRoute.snapshot, routerStateSnapshotData) as Observable<boolean>;
      canActivate.subscribe((res) => {
        expect(orgSettingsService.isBetaPageEnabledForPath).toHaveBeenCalledTimes(1);
        expect(res).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
