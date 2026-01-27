import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CacheBuster, Cacheable, globalCacheBusterNotifier } from 'ts-cacheable';
import { AuthResponse } from '../models/auth-response.model';
import { EouApiResponse } from '../models/eou-api-response.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { OrgUser } from '../models/org-user.model';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { JwtHelperService } from './jwt-helper.service';
import { TokenService } from './token.service';
import { TrackingService } from './tracking.service';
import { AccessTokenData } from '../models/access-token-data.model';
import { Delegator } from '../models/platform/delegator.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { EmployeeResponse } from '../models/employee-response.model';
import { DwollaCustomer } from '../models/dwolla-customer.model';
import { DateService } from './platform/v1/shared/date.service';

const orgUsersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OrgUserService {
  private jwtHelperService = inject(JwtHelperService);

  private tokenService = inject(TokenService);

  private apiService = inject(ApiService);

  private authService = inject(AuthService);

  private dataTransformService = inject(DataTransformService);

  private trackingService = inject(TrackingService);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private dateService = inject(DateService);

  @Cacheable()
  getCurrent(): Observable<ExtendedOrgUser> {
    return this.spenderPlatformV1ApiService
      .get('/employees/current')
      .pipe(
        map((response: PlatformApiResponse<EmployeeResponse>) =>
          this.dataTransformService.transformEmployeeResponse(response.data),
        ),
      );
  }

  @CacheBuster({
    cacheBusterNotifier: orgUsersCacheBuster$,
  })
  switchToDelegator(user_id: string, org_id: string): Observable<ExtendedOrgUser> {
    const params = {
      user_id,
      org_id,
    };

    return this.apiService
      .post<AuthResponse>('/orgusers/delegator_refresh_token', params)
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }

  @Cacheable()
  findDelegatedAccounts(): Observable<Delegator[]> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<Delegator[]>>('/employees/delegators')
      .pipe(map((response) => response.data));
  }

  postUser(user: User): Observable<User> {
    globalCacheBusterNotifier.next();
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<User>>('/users', { data: user })
      .pipe(map((res) => res.data));
  }

  postOrgUser(orgUser: Partial<OrgUser>): Observable<Partial<OrgUser>> {
    globalCacheBusterNotifier.next();
    delete orgUser.mobile_verification_attempts_left;
    const payload = {
      id: orgUser.id,
      mobile: orgUser.mobile,
    };
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<Partial<OrgUser>>>('/employees', { data: payload })
      .pipe(map((res) => res.data));
  }

  markActive(): Observable<ExtendedOrgUser> {
    return this.spenderPlatformV1ApiService.post('/employees/mark_active', { data: {} }).pipe(
      switchMap(() => this.authService.refreshEou()),
      tap(() => this.trackingService.activated()),
    );
  }

  getUserById(userId: string): Observable<EouApiResponse> {
    return this.apiService.get('/eous/' + userId);
  }

  excludeByStatus(eous: ExtendedOrgUser[], status: string): ExtendedOrgUser[] {
    let eousFiltered: ExtendedOrgUser[] = [];
    if (eous) {
      eousFiltered = eous.filter((eou) => status.indexOf(eou.ou.status) === -1);
    }
    return eousFiltered;
  }

  switchToDelegatee(): Observable<ExtendedOrgUser> {
    return this.apiService
      .post<AuthResponse>('/orgusers/delegatee_refresh_token')
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }

  async isSwitchedToDelegator(): Promise<boolean> {
    const accessTokenPromise = this.jwtHelperService.decodeToken(await this.tokenService.getAccessToken());
    const accessToken: AccessTokenData = await accessTokenPromise;
    return accessToken && !!accessToken.proxy_org_user_id;
  }

  getDwollaCustomer(): Observable<DwollaCustomer | null> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<DwollaCustomer>>(`/dwolla_customers`)
      .pipe(map((response) => this.dateService.fixDates(response.data)));
  }
}
