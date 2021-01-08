import {Injectable} from '@angular/core';
import {StorageService} from './storage.service';
import {TokenService} from './token.service';
import {ApiService} from './api.service';
import {map, switchMap} from 'rxjs/operators';
import {DataTransformService} from './data-transform.service';
import {forkJoin, from, Observable} from 'rxjs';
import {ExtendedOrgUser} from '../models/extended-org-user.model';
import {JwtHelperService} from './jwt-helper.service';
import {Cacheable} from 'ts-cacheable';

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
      switchMap(data => {
        const extendedOrgUser = this.dataTransformService.unflatten(data);
        return from(this.storageService.set('user', extendedOrgUser)).pipe(
          map(() =>  {
            return extendedOrgUser as ExtendedOrgUser;
          })
        );
      }),
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
          switchMap((res) => {
            return from(that.tokenService.setAccessToken(res.access_token));
          }),
          switchMap(() => {
            return that.refreshEou();
          })
        );
      })
    );
  }

  resendVerification(email: string) {
    return this.apiService.post('/auth/resend_email_verification', { email });
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

  async logout(logoutPayload?) {
    // CacheService.clearAll();
    await this.storageService.delete('recentlyUsedProjects');
    await this.storageService.delete('recentlyUsedCategories');
    await this.storageService.delete('recentlyUsedMileageCategories');
    await this.storageService.delete('recentlyUsedPerDiemCategories');
    await this.storageService.delete('recentlyUsedCostCenters');
    await this.storageService.delete('user');
    await this.storageService.delete('role');
    await this.storageService.delete('currentView');
    await this.storageService.delete('ui-grid-pagination-page-size');
    await this.storageService.delete('ui-grid-pagination-page-number');
    await this.storageService.delete('customExportFields');
    await this.storageService.delete('lastLoggedInDelegatee');
    await this.storageService.delete('lastLoggedInOrgQueue');
    await this.storageService.delete('isSidenavCollapsed');

    if (logoutPayload) {
      return await this.apiService.post('/auth/logout', logoutPayload);
    } else {
      return await this.apiService.post('/auth/logout');
    }
  }
}
