import { Injectable } from '@angular/core';
import { JwtHelperService } from './jwt-helper.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { DataTransformService } from './data-transform.service';
import { Cacheable, globalCacheBusterNotifier, CacheBuster } from 'ts-cacheable';
import { TrackingService } from './tracking.service';
import { ApiV2Service } from './api-v2.service';
import { Employee } from '../models/spender/employee.model';
import { EmployeeParams } from '../models/employee-params.model';
import { OrgUser } from '../models/org-user.model';
import { EouApiResponse } from '../models/eou-api-response.model';
import { ApiV2Response } from '../models/v2/api-v2-response.model';

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
      .post('/orgusers/delegator_refresh_token', orgUser)
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }

  @Cacheable()
  findDelegatedAccounts(): Observable<ExtendedOrgUser[]> {
    return this.apiService.get('/eous/current/delegated_eous').pipe(
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
      .post('/orgusers/delegatee_refresh_token')
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }

  async isSwitchedToDelegator(): Promise<boolean> {
    const accessToken = this.jwtHelperService.decodeToken(await this.tokenService.getAccessToken());
    return accessToken && !!accessToken.proxy_org_user_id;
  }
}
