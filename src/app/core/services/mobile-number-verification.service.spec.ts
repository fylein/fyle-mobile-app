import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { MobileNumberVerificationService } from './mobile-number-verification.service';
import { ApiService } from './api.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

describe('MobileNumberVerificationService', () => {
  let mobileNumberVerificationService: MobileNumberVerificationService;
  let apiService: jasmine.SpyObj<ApiService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['post']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });
    mobileNumberVerificationService = TestBed.inject(MobileNumberVerificationService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;

    apiService.post.and.returnValue(of({}));
    spenderPlatformV1ApiService.post.and.returnValue(of({}));
  });

  it('should be created', () => {
    expect(mobileNumberVerificationService).toBeTruthy();
  });

  it('sendOtp(): should send otp', () => {
    mobileNumberVerificationService.sendOtp().subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/employees/send_mobile_verification_code');
    });
  });

  it('verifyOtp(): should verify otp', () => {
    const otp = '123456';
    mobileNumberVerificationService.verifyOtp(otp).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(
        '/orgusers/check_mobile_verification_code',
        otp,
        jasmine.any(Object),
      );

      //Check if the 3rd argument is an object with Content-Type header set to desired value
      const calls = apiService.post.calls.all();
      const data = calls[0].args[2] as { headers: HttpHeaders };
      expect(data.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    });
  });
});
