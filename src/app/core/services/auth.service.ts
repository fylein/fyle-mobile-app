import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { switchMap, map, finalize } from 'rxjs/operators';
import { DataTransformService } from './data-transform.service';
import { forkJoin, Observable, from, iif } from 'rxjs';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { JwtHelperService } from './jwt-helper.service';
import { ResendEmailVerification } from '../models/resend-email-verification.model';
import { AuthResponse } from '../models/auth-response.model';
import { AccessTokenData } from '../models/access-token-data.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private storageService: StorageService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private jwtHelperService: JwtHelperService
  ) {}

  getEou(): Promise<ExtendedOrgUser> {
    return this.storageService.get<ExtendedOrgUser>('user');
  }

  refreshEou(): Observable<ExtendedOrgUser> {
    return this.apiService.get('/eous/current').pipe(
      switchMap((data) => {
        const extendedOrgUser = this.dataTransformService.unflatten(data) as ExtendedOrgUser;
        return from(this.storageService.set('user', extendedOrgUser)).pipe(
          map(() => extendedOrgUser as ExtendedOrgUser)
        );
      })
    );
  }

  newRefreshToken(token: string): Observable<ExtendedOrgUser> {
    const that = this;
    const accessToken = this.tokenService.getAccessToken();

    return forkJoin([
      that.storageService.delete('user'),
      that.storageService.delete('role'),
      that.tokenService.resetAccessToken(),
      that.tokenService.setRefreshToken(token),
    ]).pipe(
      switchMap(() =>
        that.apiService
          .post<AuthResponse>('/auth/access_token', {
            refresh_token: token,
            access_token: accessToken,
          })
          .pipe(
            switchMap((res) => from(that.tokenService.setAccessToken(res.access_token))),
            switchMap(() => that.refreshEou())
          )
      )
    );
  }

  resendEmailVerification(email: string, orgId?: string): Observable<ResendEmailVerification> {
    return this.apiService.post('/auth/resend_email_verification', { email, org_id: orgId });
  }

  getRoles() {
    return from(this.tokenService.getAccessToken()).pipe(
      map((accessToken: string) => {
        if (accessToken) {
          const tokenPayload = this.jwtHelperService.decodeToken(accessToken) as AccessTokenData;
          try {
            const roles = JSON.parse(tokenPayload.roles) as string[];
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

  logout(logoutPayload?: { device_id: string; user_id: string } | boolean) {
    // CacheService.clearAll();
    return iif(
      () => logoutPayload as boolean,
      this.apiService.post('/auth/logout', logoutPayload),
      this.apiService.post('/auth/logout')
    ).pipe(
      finalize(async () => {
        await this.storageService.delete('recentlyUsedProjects');
        await this.storageService.delete('recentlyUsedCategories');
        await this.storageService.delete('recentlyUsedMileageCategories');
        await this.storageService.delete('recentlyUsedPerDiemCategories');
        await this.storageService.delete('recentlyUsedCostCenters');
        await this.storageService.delete('user');
        await this.storageService.delete('role');
        await this.storageService.delete('currentView');
        await this.storageService.delete('lastLoggedInDelegatee');
        await this.storageService.delete('lastLoggedInOrgQueue');
        await this.storageService.delete('isSidenavCollapsed');
      })
    );
  }
}
