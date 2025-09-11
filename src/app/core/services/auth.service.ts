import { Injectable, inject } from '@angular/core';
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
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { EouPlatformApiResponse } from '../models/employee-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storageService = inject(StorageService);

  private tokenService = inject(TokenService);

  private apiService = inject(ApiService);

  private dataTransformService = inject(DataTransformService);

  private jwtHelperService = inject(JwtHelperService);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  getEou(): Promise<ExtendedOrgUser> {
    return this.storageService.get<ExtendedOrgUser>('user');
  }

  refreshEou(): Observable<ExtendedOrgUser> {
    return this.spenderPlatformV1ApiService.get('/employees/current').pipe(
      switchMap((response: PlatformApiResponse<EouPlatformApiResponse>) => {
        const extendedOrgUser = this.dataTransformService.transformExtOrgUserResponse(response.data);
        return from(this.storageService.set('user', extendedOrgUser)).pipe(map(() => extendedOrgUser));
      }),
    );
  }

  newRefreshToken(token: string): Observable<ExtendedOrgUser> {
    const that = this;
    const accessToken = from(this.tokenService.getAccessToken());

    return forkJoin([
      accessToken,
      that.storageService.delete('user'),
      that.storageService.delete('role'),
      that.tokenService.resetAccessToken(),
      that.tokenService.setRefreshToken(token),
    ]).pipe(
      switchMap(([accessToken]) =>
        that.apiService
          .post<AuthResponse>('/auth/access_token', {
            refresh_token: token,
            access_token: accessToken,
          })
          .pipe(
            switchMap((res) => from(that.tokenService.setAccessToken(res.access_token))),
            switchMap(() => that.refreshEou()),
          ),
      ),
    );
  }

  resendEmailVerification(email: string, orgId?: string): Observable<ResendEmailVerification> {
    return this.apiService.post('/auth/resend_email_verification', { email, org_id: orgId });
  }

  getRoles(): Observable<string[]> {
    return from(this.tokenService.getAccessToken()).pipe(
      map((accessToken: string) => {
        if (accessToken) {
          const tokenPayload = this.jwtHelperService.decodeToken(accessToken) as AccessTokenData;
          try {
            const roles = JSON.parse(tokenPayload.roles) as string[];
            return roles;
          } catch (e) {
            // @ts-expect-error - roles is a string in the token payload
            return tokenPayload.roles as string[];
          }
        } else {
          return [];
        }
      }),
    );
  }

  logout(logoutPayload?: { device_id: string; user_id: string } | boolean): Observable<unknown> {
    // CacheService.clearAll();
    return iif(
      () => logoutPayload as boolean,
      this.apiService.post('/auth/logout', logoutPayload),
      this.apiService.post('/auth/logout'),
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
      }),
    );
  }
}
