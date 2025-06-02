import { TestBed } from '@angular/core/testing';
import { VerifiedOrgAuthGuard } from './verified-org-auth.guard';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { apiEouRes } from '../mock-data/extended-org-user.data';

describe('VerifiedOrgAuthGuard', () => {
  let guard: VerifiedOrgAuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserPasswordStatus']);
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();
    guard = TestBed.inject(VerifiedOrgAuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate(): ', () => {
    it('should return true if eou is present and password is set or not required', (done) => {
      authService.getEou.and.resolveTo(apiEouRes);
      userService.getUserPasswordStatus.and.returnValue(of({ is_password_required: false, is_password_set: true }));
      const canActivate = guard.canActivate() as any;
      canActivate.subscribe((res: boolean) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
        expect(res).toBeTrue();
        done();
      });
    });

    it('should return false and navigate if password is required and not set', (done) => {
      authService.getEou.and.resolveTo(apiEouRes);
      userService.getUserPasswordStatus.and.returnValue(of({ is_password_required: true, is_password_set: false }));
      const canActivate = guard.canActivate() as any;
      canActivate.subscribe((res: boolean) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'switch_org']);
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return false and navigate if status is PENDING_DETAILS and password is not required', (done) => {
      authService.getEou.and.resolveTo({ ...apiEouRes, ou: { ...apiEouRes.ou, status: 'PENDING_DETAILS' } });
      userService.getUserPasswordStatus.and.returnValue(of({ is_password_required: false, is_password_set: true }));
      const canActivate = guard.canActivate() as any;
      canActivate.subscribe((res: boolean) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'switch_org']);
        expect(res).toBeFalse();
        done();
      });
    });

    it('should return false if eou is null', (done) => {
      authService.getEou.and.resolveTo(null);
      userService.getUserPasswordStatus.and.returnValue(of({ is_password_required: false, is_password_set: true }));
      const canActivate = guard.canActivate() as any;
      canActivate.subscribe((res: boolean) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
        expect(res).toBeFalse();
        done();
      });
    });
  });
});
