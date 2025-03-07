import { TestBed } from '@angular/core/testing';
import { GoogleAuthService } from './google-auth.service';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { apiAuthRes, apiLogoutRes } from '../mock-data/auth-response.data';
import { environment } from 'src/environments/environment';

describe('GoogleAuthService', () => {
  let googleAuthService: GoogleAuthService;
  let googlePlus: jasmine.SpyObj<GooglePlus>;

  beforeEach(() => {
    const googlePlusSpy = jasmine.createSpyObj('GooglePlus', ['login', 'logout']);
    TestBed.configureTestingModule({
      providers: [
        GoogleAuthService,
        {
          provide: GooglePlus,
          useValue: googlePlusSpy,
        },
      ],
    });
    googleAuthService = TestBed.inject(GoogleAuthService);
    googlePlus = TestBed.inject(GooglePlus) as jasmine.SpyObj<GooglePlus>;
  });

  it('should be created', () => {
    expect(googleAuthService).toBeTruthy();
  });

  describe('login():', () => {
    it('should login in a user via google', (done) => {
      googlePlus.login.and.resolveTo(apiAuthRes);
      googlePlus.logout.and.resolveTo(apiLogoutRes);

      googleAuthService.login().then((res) => {
        expect(res).toEqual(apiAuthRes);
        expect(googlePlus.login).toHaveBeenCalledOnceWith({
          webClientId: environment.ANDROID_CLIENT_ID,
          offline: false,
        });
        expect(googlePlus.logout).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should throw an error', (done) => {
      googlePlus.login.and.rejectWith(new Error());

      googleAuthService.login().then((res) => {
        expect(res).toEqual(new Error());
        done();
      });
    });
  });
});
