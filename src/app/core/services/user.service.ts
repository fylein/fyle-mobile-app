import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { UserPasswordStatus } from '../models/user-password-status.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private authService = inject(AuthService);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  isPendingDetails(): Observable<boolean> {
    return from(this.authService.getEou()).pipe(map((eou) => eou.ou.status === 'PENDING_DETAILS'));
  }

  getUserPasswordStatus(): Observable<UserPasswordStatus> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<UserPasswordStatus>>('/users/password_required')
      .pipe(map((res) => res.data));
  }
}
