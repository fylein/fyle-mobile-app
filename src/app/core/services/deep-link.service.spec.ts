import { TestBed } from '@angular/core/testing';
import { DeepLinkService } from './deep-link.service';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { appRoutes } from '../../app-routing.module';
import { fyleRoutes } from '../../fyle/fyle-routing.module';
import { TrackingService } from './tracking.service';
import { unflattenedTxnData } from '../mock-data/unflattened-txn.data';
import { expenseRouteData } from '../test-data/deep-link.service.spec.data';

describe('DeepLinkService', () => {
  let deepLinkService: DeepLinkService;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  const baseURL = 'https://app.fylehq.com/app';

  const mockURL =
    'https://app.fylehq.com/app/accounts/#/switch_org?fyle_redirect_url=aHR0cHM6Ly9hcHAuZnlsZWhxLmNvbS9hcHAvbWFpbi8jL215X2V4cGVuc2VzLz9zdGF0ZT1kcmFmdCZvcmdfaWQ9b3JLYWVPNXhvak9E&org_id=orKaeO5xojOD';

  const routes: Routes = {
    ...appRoutes,
    ...fyleRoutes,
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']) as jasmine.SpyObj<Router>;
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'smsDeepLinkOpened',
    ]) as jasmine.SpyObj<TrackingService>;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [
        DeepLinkService,
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
    });
    deepLinkService = TestBed.inject(DeepLinkService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
  });

  it('should be created', () => {
    expect(deepLinkService).toBeTruthy();
  });

  describe('getJsonFromUrl(): ', () => {
    it('should get json from URL', () => {
      const expectedJson = {
        fyle_redirect_url:
          'aHR0cHM6Ly9hcHAuZnlsZWhxLmNvbS9hcHAvbWFpbi8jL215X2V4cGVuc2VzLz9zdGF0ZT1kcmFmdCZvcmdfaWQ9b3JLYWVPNXhvak9E',
        org_id: 'orKaeO5xojOD',
      };

      const result = deepLinkService.getJsonFromUrl(mockURL);
      expect(result).toEqual(expectedJson);
    });

    it('should set url to redirect_uri if no other params present', () => {
      const url = 'https://fyle.app.link/orOTDe765hQp/txMLI4Cc5zY5';
      const result = deepLinkService.getJsonFromUrl(url);

      expect(result).toEqual({
        redirect_uri: url,
      });
    });

    it('should fail in case URL is not present', () => {
      const result = deepLinkService.getJsonFromUrl();
      expect(result).toEqual({});
    });
  });

  describe('redirect():', () => {
    it('should navigate to the expense page when the redirect URI contains "/view_expense/" with txn ID', () => {
      deepLinkService.redirect({
        redirect_uri: `${baseURL}/view_expense/tx1oTNwgRdRq`,
      });
      expect(router.navigate).toHaveBeenCalledWith([
        '/',
        'deep_link_redirection',
        { sub_module: 'expense', id: 'tx1oTNwgRdRq' },
      ]);
    });

    it('should navigate to the verify page when the redirect URI contains "/verify"', () => {
      deepLinkService.redirect({
        redirect_uri: `${baseURL}/verify/`,
        verification_code: 'ouX8dwsbLCLv',
        org_id: 'orYtMVz2qisQ',
      });

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'auth',
        'verify',
        {
          verification_code: 'ouX8dwsbLCLv',
          org_id: 'orYtMVz2qisQ',
        },
      ]);
    });

    it('should navigate to the new password page when the redirect URI contains "/new_password"', () => {
      deepLinkService.redirect({
        redirect_uri: `${baseURL}/new_password/`,
        refresh_token: 'token',
      });

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'auth',
        'new_password',
        {
          refreshToken: 'token',
        },
      ]);
    });

    it('should navigate to the report when the redirect URI contains "/reports" along with report ID', () => {
      const reportID = 'rpFE5X1Pqi9P';
      deepLinkService.redirect({
        redirect_uri: `${baseURL}/reports/${reportID}`,
      });

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'deep_link_redirection',
        {
          sub_module: 'report',
          id: reportID,
        },
      ]);
    });

    it('should navigate to switch organisation page when the there is no redirection URL', () => {
      deepLinkService.redirect({});
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    });

    it('should navigate to the advance request when the URI contains "/advance_request" along with advance request ID', () => {
      const advReqID = 'areqVDe9nW1X4v';

      deepLinkService.redirect({
        redirect_uri: `${baseURL}/advance_request/${advReqID}`,
      });

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'deep_link_redirection',
        {
          sub_module: 'advReq',
          id: advReqID,
        },
      ]);
    });

    it('should redirect to deep link redirection page with correct orgId and txnId', () => {
      deepLinkService.redirect({
        redirect_uri: `${baseURL}/orOTDe765hQp/txMLI4Cc5zY5`,
      });

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'deep_link_redirection',
        {
          sub_module: 'expense',
          id: 'txMLI4Cc5zY5',
          orgId: 'orOTDe765hQp',
        },
      ]);
    });

    it('should redirect to switch org page if orgId is missing in query params', () => {
      deepLinkService.redirect({
        redirect_uri: `${baseURL}/txMLI4Cc5zY5`,
      });

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    });

    it('should navigate to switch organisation page when there are incorrect details in redirection URL', () => {
      deepLinkService.redirect({
        redirect_uri: `${baseURL}/enterprise/advanceRequest/`,
      });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    });
  });

  it('getExpenseRoute(): should return the expense route based on category and state', () => {
    expenseRouteData.forEach((item) => {
      const result = deepLinkService.getExpenseRoute({
        ...unflattenedTxnData,
        tx: {
          ...unflattenedTxnData.tx,
          state: item.state,
          org_category: item.category,
        },
      });
      expect(result).toEqual(item.route);
    });
  });
});
