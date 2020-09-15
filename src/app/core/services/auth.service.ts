import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { tap, switchMap, map } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { forkJoin, Observable, from } from 'rxjs';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { JwtHelperService } from './jwt-helper.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private storageService: StorageService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private jwtHelperService: JwtHelperService
  ) { }

  getEou(): Promise<ExtendedOrgUser> {
    return this.storageService.get('user');
  }

  refreshEou(): Observable<ExtendedOrgUser> {
    return this.apiService.get('/eous/current').pipe(
      map(data => this.dataTransformService.unflatten(data)),
      tap(
        async (data) => {
          await this.storageService.set('user', data);
        }
      )
    );
  }

  newRefreshToken(token: string): Observable<ExtendedOrgUser> {
    const that = this;
    return forkJoin(
      [
        that.storageService.delete('user'),
        that.storageService.delete('role'),
        that.tokenService.resetAccessToken(),
        that.tokenService.setRefreshToken(token)
      ]
    ).pipe(
      switchMap(() => {
        return that.apiService.post('/auth/access_token', {
          refresh_token: token
        }).pipe(
          tap(async (res) => {
            await that.tokenService.setAccessToken(res.access_token);
          }),
          switchMap(() => {
            return that.refreshEou();
          })
        );
      })
    );
  }

  getRoles() {
    return from(this.tokenService.getAccessToken()).pipe(
      map(
        accessToken => {
          if (accessToken) {
            const tokenPayload = this.jwtHelperService.decodeToken(accessToken);
            const roles = tokenPayload.roles;
            return roles;
          } else {
            return [];
          }
        }
      )
    );
  }
}
