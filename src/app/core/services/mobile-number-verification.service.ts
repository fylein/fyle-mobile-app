import { Injectable, inject } from '@angular/core';
import { OtpDetails } from '../models/otp-details.model';
import { map, Observable } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

@Injectable({
  providedIn: 'root',
})
export class MobileNumberVerificationService {
  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  sendOtp(): Observable<Partial<OtpDetails>> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<OtpDetails>>('/employees/send_mobile_verification_code', { data: {} })
      .pipe(map((res) => res.data));
  }

  verifyOtp(otp: string): Observable<{ message: string }> {
    return this.spenderPlatformV1ApiService.post('/employees/check_mobile_verification_code', { data: { otp } });
  }
}
