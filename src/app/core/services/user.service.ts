import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map, switchMap } from 'rxjs/operators';
import { from, of, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { UserProperty } from '../models/v1/user-property.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private authService: AuthService, private httpClient: HttpClient, private apiService: ApiService) {}

  getCurrent(): Observable<User> {
    return this.apiService.get('/users/current');
  }

  isPendingDetails() {
    return from(this.authService.getEou()).pipe(map((eou) => eou.ou.status === 'PENDING_DETAILS'));
  }

  getCountryFromIp(): Observable<string> {
    const url = 'https://ipfind.co/me';
    const data = {
      params: {
        auth: environment.IP_FIND_KEY,
      },
    };

    return this.httpClient.get(url, data).pipe(
      map((response: any) => response.country),
      catchError((err) => of(null))
    );
  }

  getProperties(): Observable<UserProperty> {
    return this.getCurrent().pipe(switchMap((user) => this.apiService.get('/users/' + user.id + '/properties')));
  }

  upsertProperties(userProperties: UserProperty) {
    return this.getCurrent().pipe(
      switchMap((user) => this.apiService.post('/users/' + user.id + '/properties', userProperties))
    );
  }
}
