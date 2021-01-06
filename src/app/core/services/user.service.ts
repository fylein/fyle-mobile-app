import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {catchError, map} from 'rxjs/operators';
import {from, of, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) { }

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
}
