import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VerifyPage } from './verify.page';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { of, throwError } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { getElementBySelector } from 'src/app/core/dom-helpers';

describe('VerifyPage', () => {
  let component: VerifyPage;
  let fixture: ComponentFixture<VerifyPage>;
  let router: jasmine.SpyObj<Router>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let authService: jasmine.SpyObj<AuthService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  enum VerifyPageState {
    verifying,
    error,
  }

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['emailVerify']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['newRefreshToken']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['emailVerified', 'onSignin']);

    TestBed.configureTestingModule({
      declarations: [VerifyPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should navigate to switch_org route when verification is successful', () => {
    const mockResponse = { refresh_token: 'xyz123' };
    routerAuthService.emailVerify.and.returnValue(of(mockResponse));
    authService.newRefreshToken.and.returnValue(of(apiEouRes));
    fixture.detectChanges();
    expect(trackingService.emailVerified).toHaveBeenCalledTimes(1);
    expect(trackingService.onSignin).toHaveBeenCalledOnceWith('ajain@fyle.in');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { invite_link: true }]);
    const verifyHeader = getElementBySelector(fixture, '#verify--header');
    const verifySubheader = getElementBySelector(fixture, '.verify--form-subheader');
    expect(verifyHeader.textContent).toContain('Verifying Identity');
    expect(verifySubheader.textContent).toContain('Checking your credentials..');
  });

  it('ngOnInit(): should handle error when verification fails', () => {
    const mockError = new Error('Verification failed');
    routerAuthService.emailVerify.and.returnValue(throwError(() => mockError));
    fixture.detectChanges();
    spyOn(component, 'handleError');
    component.ngOnInit();
    expect(component.handleError).toHaveBeenCalledOnceWith(mockError);
    const verifyHeader = getElementBySelector(fixture, '#verify--header');
    const verifySubheader = getElementBySelector(fixture, '.verify--form-subheader');
    expect(verifyHeader.textContent).toContain('Verification Failed');
    expect(verifySubheader.textContent).toContain(
      'Unable to verify your Fyle account. Please contact support by sending an email to support@fylehq.com'
    );
  });

  describe('handleError(): ', () => {
    it('should navigate to auth/disabled if status code is 422', () => {
      const error = {
        status: 422,
      };
      component.handleError(error);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'disabled']);
      expect(component.currentPageState).not.toEqual(VerifyPageState.error);
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
      expect(component.currentPageState).not.toEqual(VerifyPageState.error);
    });

    it('should change the page status if error code is something else', () => {
      const error = {
        status: 404,
      };
      component.handleError(error);
      expect(component.currentPageState).toEqual(VerifyPageState.error);
    });
  });
});
