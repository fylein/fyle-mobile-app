import { TestBed } from '@angular/core/testing';
import { VerifiedOrgAuthGuard } from './verified-org-auth.guard';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { LoaderService } from '../services/loader.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('VerifiedOrgAuthGuard', () => {
  let guard: VerifiedOrgAuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserPasswordStatus']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    loaderServiceSpy.showLoader.and.resolveTo();
    loaderServiceSpy.hideLoader.and.resolveTo();
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
      ],
    }).compileComponents();
    guard = TestBed.inject(VerifiedOrgAuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate(): ', () => {
    it('should return true if eou is present and password is set or not required', fakeAsync(() => {
      authService.getEou.and.resolveTo(apiEouRes);
      userService.getUserPasswordStatus.and.returnValue(of({ is_password_required: false, is_password_set: true }));
      const canActivate = guard.canActivate() as any;
      let result: boolean;
      canActivate.subscribe((res: boolean) => {
        result = res;
      });
      tick();
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(result).toBeTrue();
    }));

    it('should return false and navigate if password is required and not set', fakeAsync(() => {
      authService.getEou.and.resolveTo(apiEouRes);
      userService.getUserPasswordStatus.and.returnValue(of({ is_password_required: true, is_password_set: false }));
      const canActivate = guard.canActivate() as any;
      let result: boolean;
      canActivate.subscribe((res: boolean) => {
        result = res;
      });
      tick();
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'switch_org']);
      expect(result).toBeFalse();
    }));

    it('should return false and navigate if status is PENDING_DETAILS and password is not required', fakeAsync(() => {
      authService.getEou.and.resolveTo({ ...apiEouRes, ou: { ...apiEouRes.ou, status: 'PENDING_DETAILS' } });
      userService.getUserPasswordStatus.and.returnValue(of({ is_password_required: false, is_password_set: true }));
      const canActivate = guard.canActivate() as any;
      let result: boolean;
      canActivate.subscribe((res: boolean) => {
        result = res;
      });
      tick();
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/', 'auth', 'switch_org']);
      expect(result).toBeFalse();
    }));

    it('should return false if eou is null', fakeAsync(() => {
      authService.getEou.and.resolveTo(null);
      userService.getUserPasswordStatus.and.returnValue(of({ is_password_required: false, is_password_set: true }));
      const canActivate = guard.canActivate() as any;
      let result: boolean;
      canActivate.subscribe((res: boolean) => {
        result = res;
      });
      tick();
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(userService.getUserPasswordStatus).toHaveBeenCalledTimes(1);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(result).toBeFalse();
    }));
  });
});
