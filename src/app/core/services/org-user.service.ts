import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CacheBuster, Cacheable, globalCacheBusterNotifier } from 'ts-cacheable';
import { AuthResponse } from '../models/auth-response.model';
import { EmployeeParams } from '../models/employee-params.model';
import { EouApiResponse } from '../models/eou-api-response.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { OrgUser } from '../models/org-user.model';
import { Employee } from '../models/spender/employee.model';
import { User } from '../models/user.model';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { JwtHelperService } from './jwt-helper.service';
import { TokenService } from './token.service';
import { TrackingService } from './tracking.service';
import { AccessTokenData } from '../models/access-token-data.model';

const orgUsersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OrgUserService {
  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private authService: AuthService,
    private dataTransformService: DataTransformService,
    private trackingService: TrackingService,
    private apiV2Service: ApiV2Service
  ) {}

  @Cacheable()
  getCurrent(): Observable<ExtendedOrgUser> {
    return this.apiService.get('/eous/current').pipe(map((eou) => this.dataTransformService.unflatten(eou)));
  }

  @Cacheable({
    cacheBusterObserver: orgUsersCacheBuster$,
  })
  getEmployeesByParams(params: Partial<EmployeeParams>) {
    return this.apiV2Service.get<Partial<Employee>, {}>('/spender_employees', { params });
  }

  @CacheBuster({
    cacheBusterNotifier: orgUsersCacheBuster$,
  })
  switchToDelegator(orgUser: OrgUser): Observable<ExtendedOrgUser> {
    return this.apiService
      .post<AuthResponse>('/orgusers/delegator_refresh_token', orgUser)
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }

  @Cacheable()
  findDelegatedAccounts(): Observable<ExtendedOrgUser[]> {
    return this.apiService.get<ExtendedOrgUser[]>('/eous/current/delegated_eous').pipe(
      map((delegatedAccounts) => {
        delegatedAccounts = delegatedAccounts.map((delegatedAccount) =>
          this.dataTransformService.unflatten(delegatedAccount)
        );

        return delegatedAccounts;
      })
    );
  }

  postUser(user: User): Observable<User> {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/users', user);
  }

  postOrgUser(orgUser: Partial<OrgUser>): Observable<Partial<OrgUser>> {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/orgusers', orgUser);
  }

  markActive(): Observable<ExtendedOrgUser> {
    return this.apiService.post('/orgusers/current/mark_active').pipe(
      switchMap(() => this.authService.refreshEou()),
      tap(() => this.trackingService.activated())
    );
  }

  getEmployeesBySearch(params: Partial<EmployeeParams>): Observable<Partial<Employee>[]> {
    if (params.or) {
      params.and = `(or${params.or},or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"))`;
    } else {
      params.or = '(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS")';
    }
    return this.getEmployeesByParams({
      ...params,
    }).pipe(map((res) => res.data));
  }

  getUserById(userId: string): Observable<EouApiResponse> {
    return this.apiService.get('/eous/' + userId);
  }

  excludeByStatus(eous: ExtendedOrgUser[], status: string): ExtendedOrgUser[] {
    let eousFiltered = [];
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
}
