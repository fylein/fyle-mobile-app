import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {catchError, map, switchMap} from 'rxjs/operators';
import {from, of} from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private apiService: ApiService
  ) { }

  getCurrent() {
    return this.apiService.get('/users/current')
  }

  isPendingDetails() {
    return from(this.authService.getEou()).pipe(
      map(eou => eou.ou.status === 'PENDING_DETAILS')
    );
  }

  getCountryFromIp() {
    const url = 'https://ipfind.co/me';
    const data = {
      params: {
        auth: environment.IP_FIND_KEY
      }
    };

    return this.httpClient.get(url, data).pipe(
      map((response: any) => response.country),
      catchError(err => of(null)
      )
    );
  }

  getProperties() {
    return this.getCurrent().pipe(
      switchMap((user) => {
        return this.apiService.get('/users/' + user.id + '/properties');
      })
    )
  }

  upsertProperties(userProperties) {
    return this.getCurrent().pipe(
      switchMap((user) => {
        return this.apiService.post('/users/' + user.id + '/properties', userProperties);
      })
    )
  }
}
