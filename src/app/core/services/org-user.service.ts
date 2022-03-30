import { Injectable } from '@angular/core';
import { JwtHelperService } from './jwt-helper.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { concatMap, map, reduce, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Observable, range, Subject, from } from 'rxjs';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { DataTransformService } from './data-transform.service';
import { Cacheable, globalCacheBusterNotifier, CacheBuster } from 'ts-cacheable';
import { TrackingService } from './tracking.service';
import { ApiV2Service } from './api-v2.service';
import { Employee } from '../models/employee.model';

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
  getCurrent() {
    return this.apiService.get('/eous/current').pipe(map((eou) => this.dataTransformService.unflatten(eou)));
  }

  // TODO: move to v2
  @Cacheable({
    cacheBusterObserver: orgUsersCacheBuster$,
  })
  getEmployeesByParams(params): Observable<{
    count: number;
    data: Employee[];
    limit: number;
    offset: number;
    url: string;
  }> {
    return this.apiV2Service.get('/employees', { params });
  }

  @CacheBuster({
    cacheBusterNotifier: orgUsersCacheBuster$,
  })
  switchToDelegator(orgUser) {
    return this.apiService
      .post('/orgusers/delegator_refresh_token', orgUser)
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }

  postUser(user: User) {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/users', user);
  }

  postOrgUser(orgUser) {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/orgusers', orgUser);
  }

  markActive() {
    return this.apiService.post('/orgusers/current/mark_active').pipe(
      switchMap(() => this.authService.refreshEou()),
      tap(() => this.trackingService.activated())
    );
  }

  getEmployees(params): Observable<Employee[]> {
    return this.getEmployeesByParams({ ...params, limit: 1 }).pipe(
      switchMap((res) => {
        const count = res.count > 200 ? res.count / 200 : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getEmployeesByParams({ ...params, offset: 200 * page, limit: 200 })),
      reduce((acc, curr) => acc.concat(curr.data), [] as Employee[])
    );
  }

  getEmployeesBySearch(params): Observable<Employee[]> {
    if (params.or) {
      params.and = `(or${params.or},or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"))`;
    } else {
      params.or = '(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS")';
    }
    return this.getEmployeesByParams({
      ...params,
    }).pipe(map((res) => res.data));
  }

  getUserById(userId: string) {
    return this.apiService.get('/eous/' + userId);
  }

  exclude(eous: ExtendedOrgUser[], userIds: string[]) {
    return eous.filter((eou) => userIds.indexOf(eou.ou.id) === -1);
  }

  // TODO: move to v2
  findDelegatedAccounts() {
    return this.apiService.get('/eous/current/delegated_eous').pipe(
      map((delegatedAccounts) => {
        delegatedAccounts = delegatedAccounts.map((delegatedAccount) =>
          this.dataTransformService.unflatten(delegatedAccount)
        );

        return delegatedAccounts;
      })
    );
  }

  excludeByStatus(eous: ExtendedOrgUser[], status: string) {
    const eousFiltered = eous.filter((eou) => status.indexOf(eou.ou.status) === -1);
    return eousFiltered;
  }

  filterByRole(eous: ExtendedOrgUser[], role: string) {
    const eousFiltered = eous.filter((eou) => eou.ou.roles.indexOf(role));

    return eousFiltered;
  }

  filterByRoles(eous: ExtendedOrgUser[], role) {
    const filteredEous = eous.filter((eou) =>
      role.some((userRole) => {
        if (eou.ou.roles.indexOf(userRole) > -1) {
          return true;
        }
      })
    );

    return filteredEous;
  }

  switchToDelegatee() {
    return this.apiService
      .post('/orgusers/delegatee_refresh_token')
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }

  async isSwitchedToDelegator() {
    const accessToken = this.jwtHelperService.decodeToken(await this.tokenService.getAccessToken());
    return accessToken && !!accessToken.proxy_org_user_id;
  }
}
