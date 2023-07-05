import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpHeaders } from '@angular/common/http';
import { OtpDetails } from '../models/otp-details.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MobileNumberVerificationService {
  constructor(private apiService: ApiService) {}

  sendOtp(): Observable<OtpDetails> {
    return this.apiService.post('/orgusers/verify_mobile');
  }

  verifyOtp(otp: string): Observable<{ message: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.apiService.post('/orgusers/check_mobile_verification_code', otp, { headers });
  }
}
