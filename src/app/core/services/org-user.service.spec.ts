import { TestBed } from '@angular/core/testing';
import { JwtHelperService } from '@auth0/angular-jwt';
import { currentEouRes, currentEouUnflatted } from '../test-data/org-user.service.spec.data';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { of } from 'rxjs';
import { OrgUserService } from './org-user.service';
import { TokenService } from './token.service';

describe('OrgUserService', () => {
  let orgUserService: OrgUserService;
  let jwtHelperService: jasmine.SpyObj<JwtHelperService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const jwtHelperServiceSpy = jasmine.createSpyObj('JwtHelperService', ['decodeToken']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getAccessToken']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['newRefreshToken', 'refreshEou']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);

    TestBed.configureTestingModule({
      providers: [
        OrgUserService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiv2ServiceSpy,
        },
        {
          provide: JwtHelperService,
          useValue: jwtHelperServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
      ],
    });
    orgUserService = TestBed.inject(OrgUserService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    jwtHelperService = TestBed.inject(JwtHelperService) as jasmine.SpyObj<JwtHelperService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
  });

  it('should be created', () => {
    expect(orgUserService).toBeTruthy();
  });

  it('should be able to get current eou', (done) => {
    apiService.get.and.returnValue(of(currentEouUnflatted));
    dataTransformService.unflatten.withArgs(currentEouUnflatted).and.returnValue(currentEouRes);

    orgUserService.getCurrent().subscribe((res) => {
      expect(res).toEqual(currentEouRes);
      done();
    });
  });
});
