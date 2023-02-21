import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DeepLinkService } from './deep-link.service';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { appRoutes } from '../../app-routing.module';
import { fyleRoutes } from '../../fyle/fyle-routing.module';

describe('DeepLinkService', () => {
  let deepLinkService: DeepLinkService;
  let router: jasmine.SpyObj<Router>;
  let location: jasmine.SpyObj<Location>;

  const URL =
    'https://fyle.app.link/branchio_redirect?redirect_uri=https%3A%2F%2Fstaging.fylehq.ninja%2Fapp%2Fmain%2F%23%2Fenterprise%2Freports%2Frpsv8oKuAfGe&org_id=orrjqbDbeP9p';

  const routes: Routes = {
    ...appRoutes,
    ...fyleRoutes,
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const locationSpy = jasmine.createSpyObj('Location', ['path']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [
        DeepLinkService,
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: Location,
          useValue: locationSpy,
        },
      ],
    });
    deepLinkService = TestBed.inject(DeepLinkService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    location = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  it('should be created', () => {
    expect(deepLinkService).toBeTruthy();
  });

  it('should get json from URL', () => {
    const expectedJson = {
      redirect_uri: 'https://staging.fylehq.ninja/app/main/#/enterprise/reports/rpsv8oKuAfGe',
      org_id: 'orrjqbDbeP9p',
    };

    const result = deepLinkService.getJsonFromUrl(URL);
    expect(result).toEqual(expectedJson);
  });

  it('should fail in case URL is not present', () => {
    const result = deepLinkService.getJsonFromUrl();
    expect(result).toEqual({});
  });

  describe('redirect():', () => {
    it('should navigate to the expense page when the redirect URI contains "/view_expense/" with txn ID', () => {
      deepLinkService.redirect({
        redirect_uri: 'https://staging.fyle.tech/app/main/#/enterprise/view_expense/tx1oTNwgRdRq',
      });
      expect(router.navigate).toHaveBeenCalledWith([
        '/',
        'deep_link_redirection',
        { sub_module: 'expense', id: 'tx1oTNwgRdRq' },
      ]);
    });

    it('should navigate to the verify page when the redirect URI contains "/verify"', () => {
      deepLinkService.redirect({
        redirect_uri: 'https://staging.fyle.tech/app/main/#/verify/',
        verification_code: '12345',
        org_id: 'orYtMVz2qisQ',
      });

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'auth',
        'verify',
        {
          verification_code: '12345',
          org_id: 'orYtMVz2qisQ',
        },
      ]);
    });

    it('should navigate to the new password page when the redirect URI contains "/new_password"', () => {
      deepLinkService.redirect({
        redirect_uri: 'https://staging.fyle.tech/app/main/#/new_password/',
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
        redirect_uri: `https://staging.fyle.tech/app/main/#/enterprise/reports/${reportID}`,
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
        redirect_uri: `https://staging.fyle.tech/app/main/#/enterprise/advance_request/${advReqID}`,
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

    it('should navigate to switch organisation page when there are incorrect details in redirection URL', () => {
      deepLinkService.redirect({
        redirect_uri: `https://staging.fyle.tech/app/main/#/enterprise/advanceRequest/`,
      });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'switch_org', { choose: true }]);
    });
  });
});
