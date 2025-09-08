import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MobileNumberVerificationService } from './mobile-number-verification.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

describe('MobileNumberVerificationService', () => {
  let mobileNumberVerificationService: MobileNumberVerificationService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['post']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });
    mobileNumberVerificationService = TestBed.inject(MobileNumberVerificationService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;

    spenderPlatformV1ApiService.post.and.returnValue(of({}));
  });

  it('should be created', () => {
    expect(mobileNumberVerificationService).toBeTruthy();
  });

  it('sendOtp(): should send otp', () => {
    mobileNumberVerificationService.sendOtp().subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/employees/send_mobile_verification_code', {
        data: {},
      });
    });
  });

  it('verifyOtp(): should verify otp', () => {
    const otp = '123456';
    mobileNumberVerificationService.verifyOtp(otp).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/employees/check_mobile_verification_code', {
        data: { otp },
      });
    });
  });
});
