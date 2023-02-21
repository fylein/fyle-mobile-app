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

  xit('should redirect to auth verification', fakeAsync(() => {
    const testParam = {
      redirect_uri: 'https://staging.fylehq.ninja/app/main/#/enterprise/reports/rpsv8oKuAfGe',
      org_id: 'orrjqbDbeP9p',
    };
    deepLinkService.redirect(testParam);
    tick();
    router
      .navigate([
        '/',
        'deep_link_redirection',
        {
          sub_module: 'reports',
          id: 'tx1oTNwgRdRq',
        },
      ])
      .then((data) => {
        console.log(data);
      });
  }));
});
