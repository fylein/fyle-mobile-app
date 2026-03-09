import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { UserPasswordStatus } from '../models/user-password-status.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

const USER_PASSWORD_STATUS_STORAGE_KEY = 'userPasswordStatus';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private authService = inject(AuthService);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private storageService = inject(StorageService);

  isPendingDetails(): Observable<boolean> {
    return from(this.authService.getEou()).pipe(map((eou) => eou.ou.status === 'PENDING_DETAILS'));
  }

  clearUserPasswordStatusCache(): void {
    void this.storageService.delete(USER_PASSWORD_STATUS_STORAGE_KEY);
  }

  getUserPasswordStatusCached(): Observable<UserPasswordStatus> {
    return from(this.storageService.get<UserPasswordStatus>(USER_PASSWORD_STATUS_STORAGE_KEY)).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }
        return this.getUserPasswordStatus().pipe(
          tap((data) => {
            void this.storageService.set(USER_PASSWORD_STATUS_STORAGE_KEY, data);
          }),
        )
      }),
    );
  }

  getUserPasswordStatus(): Observable<UserPasswordStatus> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<UserPasswordStatus>>('/users/password_required')
      .pipe(map((res) => res.data));
  }
}
