import { TestBed } from '@angular/core/testing';

import { VerifiedOrgAuthGuard } from './verified-org-auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { apiEouRes, eouWithPendingDetails } from '../mock-data/extended-org-user.data';
import { routerStateSnapshotData } from '../mock-data/router-state-snapshot.data';

describe('AuthGuard', () => {
  let guard: VerifiedOrgAuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    let routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    let authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
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
    }).compileComponents();
    guard = TestBed.inject(VerifiedOrgAuthGuard);

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate(): ', () => {
    it('should return true if eou is present', (done) => {
      authService.getEou.and.resolveTo(apiEouRes);
      const canActivate = guard.canActivate(activatedRoute.snapshot, routerStateSnapshotData) as Promise<boolean>;
      canActivate.then((res) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return false if eou is not present', (done) => {
      authService.getEou.and.resolveTo(null);
      const canActivate = guard.canActivate(activatedRoute.snapshot, routerStateSnapshotData) as Promise<boolean>;
      canActivate.then((res) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(res).toBeFalse();
        done();
      });
    });

    it('should navigate to switch org if status is PENDING_DETAILS', (done) => {
      authService.getEou.and.resolveTo(eouWithPendingDetails);
      const canActivate = guard.canActivate(activatedRoute.snapshot, routerStateSnapshotData) as Promise<boolean>;
      canActivate.then((res) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(res).toBeTrue();
        expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'switch_org']);
        done();
      });
    });
  });
});
