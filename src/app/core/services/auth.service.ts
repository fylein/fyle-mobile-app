import { Injectable } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { switchMap, map, finalize } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { forkJoin, Observable, from, iif } from 'rxjs';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { JwtHelperService } from './jwt-helper.service';
import { Cacheable } from 'ts-cacheable';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private secureStorageService: SecureStorageService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private jwtHelperService: JwtHelperService
  ) {}

  getEou(): Promise<ExtendedOrgUser> {
    return this.secureStorageService.get('user');
  }

  refreshEou(): Observable<ExtendedOrgUser> {
    return this.apiService.get('/eous/current').pipe(
      switchMap((data) => {
        const extendedOrgUser = this.dataTransformService.unflatten(data);
        return from(this.secureStorageService.set('user', extendedOrgUser)).pipe(
          map(() => extendedOrgUser as ExtendedOrgUser)
        );
      })
    );
  }

  newRefreshToken(token: string): Observable<ExtendedOrgUser> {
    const that = this;
    return forkJoin([
      that.secureStorageService.delete('user'),
      that.secureStorageService.delete('role'),
      that.tokenService.resetAccessToken(),
      that.tokenService.setRefreshToken(token),
    ]).pipe(
      switchMap(() =>
        that.apiService
          .post('/auth/access_token', {
            refresh_token: token,
          })
          .pipe(
            switchMap((res) => from(that.tokenService.setAccessToken(res.access_token))),
            switchMap(() => that.refreshEou())
          )
      )
    );
  }

  resendVerification(email: string) {
    return this.apiService.post('/auth/resend_email_verification', { email });
  }

  getRoles() {
    return from(this.tokenService.getAccessToken()).pipe(
      map((accessToken) => {
        if (accessToken) {
          const tokenPayload = this.jwtHelperService.decodeToken(accessToken);
          try {
            const roles = JSON.parse(tokenPayload.roles);
            return roles;
          } catch (e) {
            return [];
          }
        } else {
          return [];
        }
      })
    );
  }

  logout(logoutPayload?) {
    // CacheService.clearAll();
    return iif(
      () => logoutPayload,
      this.apiService.post('/auth/logout', logoutPayload),
      this.apiService.post('/auth/logout')
    ).pipe(
      finalize(async () => {
        await this.secureStorageService.delete('recentlyUsedProjects');
        await this.secureStorageService.delete('recentlyUsedCategories');
        await this.secureStorageService.delete('recentlyUsedMileageCategories');
        await this.secureStorageService.delete('recentlyUsedPerDiemCategories');
        await this.secureStorageService.delete('recentlyUsedCostCenters');
        await this.secureStorageService.delete('user');
        await this.secureStorageService.delete('role');
        await this.secureStorageService.delete('currentView');
        await this.secureStorageService.delete('ui-grid-pagination-page-size');
        await this.secureStorageService.delete('ui-grid-pagination-page-number');
        await this.secureStorageService.delete('customExportFields');
        await this.secureStorageService.delete('lastLoggedInDelegatee');
        await this.secureStorageService.delete('lastLoggedInOrgQueue');
        await this.secureStorageService.delete('isSidenavCollapsed');
      })
    );
  }
}
