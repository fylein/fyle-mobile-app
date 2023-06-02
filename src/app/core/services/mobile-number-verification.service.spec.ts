import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { MobileNumberVerificationService } from './mobile-number-verification.service';
import { ApiService } from './api.service';

describe('MobileNumberVerificationService', () => {
  let mobileNumberVerificationService: MobileNumberVerificationService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
      ],
    });
    mobileNumberVerificationService = TestBed.inject(MobileNumberVerificationService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    apiService.post.and.returnValue(of({}));
  });

  it('should be created', () => {
    expect(mobileNumberVerificationService).toBeTruthy();
  });

  it('sendOtp(): should send otp', () => {
    mobileNumberVerificationService.sendOtp().subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith('/orgusers/verify_mobile');
    });
  });

  it('verifyOtp(): should verify otp', () => {
    const otp = '123456';
    mobileNumberVerificationService.verifyOtp(otp).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(
        '/orgusers/check_mobile_verification_code',
        otp,
        jasmine.any(Object)
      );

      //Check if the 3rd argument is an object with Content-Type header set to desired value
      const calls = apiService.post.calls.all();
      const data = calls[0].args[2] as { headers: HttpHeaders };
      expect(data.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    });
  });
});
