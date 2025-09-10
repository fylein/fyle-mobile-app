import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VerifyPage } from './verify.page';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { UserEventService } from 'src/app/core/services/user-event.service';

describe('VerifyPage', () => {
  let component: VerifyPage;
  let fixture: ComponentFixture<VerifyPage>;
  let router: jasmine.SpyObj<Router>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let authService: jasmine.SpyObj<AuthService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let userEventService: jasmine.SpyObj<UserEventService>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['emailVerify']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshEou']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['emailVerified', 'onSignin', 'eventTrack']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['logout']);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), RouterTestingModule, VerifyPage],
      providers: [
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: RouterAuthService,
          useValue: routerAuthServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { verification_code: 'ouX8dwsbLCLv', org_id: 'orNVthTo2Zyo' },
            },
          },
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit(): ', () => {
    it('should navigate to switch_org route when verification is successful', () => {
      const mockResponse = { refresh_token: 'xyz123' };
      routerAuthService.emailVerify.and.returnValue(of(mockResponse));
      authService.refreshEou.and.returnValue(of(apiEouRes));
      fixture.detectChanges();
      expect(trackingService.emailVerified).toHaveBeenCalledTimes(1);
      expect(trackingService.onSignin).toHaveBeenCalledOnceWith(apiEouRes.us.id);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { invite_link: true }]);
    });
  });

  describe('handleError(): ', () => {
    it('should navigate to auth/disabled if status code is 422', () => {
      const error = {
        status: 422,
      };
      component.handleError(error);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'disabled']);
    });

    it('should navigate to auth/pending_verification if status code is 440', () => {
      const error = {
        status: 440,
      };
      component.handleError(error);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'auth',
        'pending_verification',
        { hasTokenExpired: true, orgId: 'orNVthTo2Zyo' },
      ]);
    });

    it('should change the page status if error code is something else', () => {
      const error = {
        status: 404,
      };
      const logoutSpy = spyOn(component, 'logout');
      component.handleError(error);
      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('logout(): should log out the user', () => {
    component.logout();
    expect(userEventService.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'sign_in']);
  });
});
