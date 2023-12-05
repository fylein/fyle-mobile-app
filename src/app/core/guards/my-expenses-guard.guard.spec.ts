import { TestBed } from '@angular/core/testing';

import { MyExpensesGuardGuard } from './my-expenses-guard.guard';
import { ActivatedRoute, Router } from '@angular/router';
import { OrgSettingsService } from '../services/org-settings.service';
import { Observable, of } from 'rxjs';
import { orgSettingsWithV2ExpensesPage, orgSettingsWoV2ExpensesPage } from '../mock-data/org-settings.data';

describe('MyExpensesGuardGuard', () => {
  let guard: MyExpensesGuardGuard;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let orgSettingsSerivce: jasmine.SpyObj<OrgSettingsService>;

  beforeEach(() => {
    const orgSettingsSerivceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: OrgSettingsService,
          useValue: orgSettingsSerivceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                url: '/enterprise/dashboard',
                root: null,
              },
            },
          },
        },
      ],
    });
    guard = TestBed.inject(MyExpensesGuardGuard);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    orgSettingsSerivce = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate():', () => {
    it('should navigate to v2 page if settings is enabled', (done) => {
      orgSettingsSerivce.get.and.returnValue(of(orgSettingsWithV2ExpensesPage));

      const result = guard.canActivate(activatedRoute.snapshot, { url: '/test', root: null }) as Observable<boolean>;

      result.subscribe(() => {
        expect(orgSettingsSerivce.get).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses-v2']);
        done();
      });
    });

    it('should navigate to old page if setting is disbaled', (done) => {
      orgSettingsSerivce.get.and.returnValue(of(orgSettingsWoV2ExpensesPage));

      const result = guard.canActivate(activatedRoute.snapshot, { url: '/test', root: null }) as Observable<boolean>;

      result.subscribe((res) => {
        expect(res).toBeTrue();
        expect(orgSettingsSerivce.get).toHaveBeenCalledTimes(1);
        expect(router.navigate).not.toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses-v2']);
        done();
      });
    });
  });
});
