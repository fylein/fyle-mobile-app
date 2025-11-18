import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { UserPasswordStatus } from '../models/user-password-status.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private authService = inject(AuthService);

  private apiService = inject(ApiService);

  getCurrent(): Observable<User> {
    return this.apiService.get<User>('/users/current').pipe(
      map((userRaw) => ({
        ...userRaw,
        created_at: userRaw.created_at && new Date(userRaw.created_at),
        updated_at: userRaw.updated_at && new Date(userRaw.updated_at),
        email_verified_at: userRaw.email_verified_at && new Date(userRaw.email_verified_at),
        password_changed_at: userRaw.password_changed_at && new Date(userRaw.password_changed_at),
      })),
    );
  }

  isPendingDetails(): Observable<boolean> {
    return from(this.authService.getEou()).pipe(map((eou) => eou.ou.status === 'PENDING_DETAILS'));
  }

  getUserPasswordStatus(): Observable<UserPasswordStatus> {
    return this.apiService.get('/users/password_required');
  }
}
