import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserPasswordStatus } from '../models/user-password-status.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private authService = inject(AuthService);

  private apiService = inject(ApiService);

  isPendingDetails(): Observable<boolean> {
    return from(this.authService.getEou()).pipe(map((eou) => eou.ou.status === 'PENDING_DETAILS'));
  }

  getUserPasswordStatus(): Observable<UserPasswordStatus> {
    return this.apiService.get('/users/password_required');
  }
}
