import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { HttpHeaders } from '@angular/common/http';
import { OtpDetails } from '../models/otp-details.model';
import { Observable } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

@Injectable({
  providedIn: 'root',
})
export class MobileNumberVerificationService {
  private apiService = inject(ApiService);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  sendOtp(): Observable<Partial<OtpDetails>> {
    return this.spenderPlatformV1ApiService.post('/employees/send_mobile_verification_code');
  }

  verifyOtp(otp: string): Observable<{ message: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.apiService.post('/orgusers/check_mobile_verification_code', otp, { headers });
  }
}
