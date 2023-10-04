import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { apiEouRes } from '../mock-data/extended-org-user.data';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpy,
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
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate():', () => {
    it('should return the user org', async () => {
      authService.getEou.and.resolveTo(apiEouRes);

      const result = await guard.canActivate(activatedRoute.snapshot, { url: '/test', root: null });

      expect(result).toBeTrue();
      expect(authService.getEou).toHaveBeenCalledTimes(1);
    });

    it('should navigate to sign in page if org is not present', async () => {
      authService.getEou.and.resolveTo(null);

      await guard.canActivate(activatedRoute.snapshot, { url: '/test', root: null });

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'sign_in']);
    });
  });
});
