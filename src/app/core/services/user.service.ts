import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map, switchMap } from 'rxjs/operators';
import { from, of, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { UserProperty } from '../models/v1/user-property.model';
import { UserPasswordStatus } from '../models/user-password-status.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private authService: AuthService, private apiService: ApiService) {}

  getCurrent(): Observable<User> {
    return this.apiService.get<User>('/users/current').pipe(
      map((userRaw) => ({
        ...userRaw,
        created_at: userRaw.created_at && new Date(userRaw.created_at),
        updated_at: userRaw.updated_at && new Date(userRaw.updated_at),
        email_verified_at: userRaw.email_verified_at && new Date(userRaw.email_verified_at),
        password_changed_at: userRaw.password_changed_at && new Date(userRaw.password_changed_at),
      }))
    );
  }

  isPendingDetails() {
    return from(this.authService.getEou()).pipe(map((eou) => eou.ou.status === 'PENDING_DETAILS'));
  }

  getProperties(): Observable<UserProperty> {
    return this.getCurrent()
      .pipe(switchMap((user) => this.apiService.get<UserProperty>('/users/' + user.id + '/properties')))
      .pipe(
        map((userPropertiesRaw) => ({
          ...userPropertiesRaw,
          created_at: userPropertiesRaw.created_at && new Date(userPropertiesRaw.created_at),
          updated_at: userPropertiesRaw.updated_at && new Date(userPropertiesRaw.updated_at),
        }))
      );
  }

  upsertProperties(userProperties: UserProperty): Observable<UserProperty> {
    return this.getCurrent().pipe(
      switchMap((user) => this.apiService.post<UserProperty>('/users/' + user.id + '/properties', userProperties))
    );
  }

  getUserPasswordStatus(): Observable<UserPasswordStatus> {
    return this.apiService.get('/users/password_required');
  }
}
