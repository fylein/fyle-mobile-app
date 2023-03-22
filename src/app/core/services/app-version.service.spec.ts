import { TestBed } from '@angular/core/testing';
import { AppVersionService } from './app-version.service';
import { ApiService } from './api.service';
import { RouterApiService } from './router-api.service';
import { LoginInfoService } from './login-info.service';
import { AuthService } from './auth.service';

describe('AppVersionService', () => {
  let appVersionService: AppVersionService;
  let apiService: jasmine.SpyObj<ApiService>;
  let routerApiService: jasmine.SpyObj<RouterApiService>;
  let loginInfoService: jasmine.SpyObj<LoginInfoService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const routerApiServiceSpy = jasmine.createSpyObj('RouterApiService', ['post']);
    const loginInfoServiceSpy = jasmine.createSpyObj('LoginInfoService', ['getLastLoggedInVersion']);
    TestBed.configureTestingModule({
      providers: [
        AppVersionService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: RouterApiService,
          useValue: routerApiServiceSpy,
        },
        {
          provide: LoginInfoService,
          useValue: loginInfoServiceSpy,
        },
      ],
    });
    appVersionService = TestBed.inject(AppVersionService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loginInfoService = TestBed.inject(LoginInfoService) as jasmine.SpyObj<LoginInfoService>;
    routerApiService = TestBed.inject(RouterApiService) as jasmine.SpyObj<RouterApiService>;
  });

  it('should be created', () => {
    expect(appVersionService).toBeTruthy();
  });
});
