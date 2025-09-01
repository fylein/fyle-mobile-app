import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { OtpDetails } from '../models/otp-details.model';
import { Observable } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

@Injectable({
  providedIn: 'root',
})
export class MobileNumberVerificationService {
  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  sendOtp(): Observable<Partial<OtpDetails>> {
    return this.spenderPlatformV1ApiService.post('/employees/send_mobile_verification_code');
  }

  verifyOtp(otp: string): Observable<{ message: string }> {
    return this.spenderPlatformV1ApiService.post('/employees/check_mobile_verification_code', { data: { otp } });
  }
}
