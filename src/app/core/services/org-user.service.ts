import { Injectable } from '@angular/core';
import { JwtHelperService } from './jwt-helper.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { switchMap, expand, reduce, tap, concatMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { range, of, Observable, from } from 'rxjs';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { DataTransformService } from './data-transform.service';
import { Cacheable } from 'ts-cacheable';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class OrgUserService {

  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private authService: AuthService,
    private dataTransformService: DataTransformService,
    private storageService: StorageService
  ) { }

  postUser(user: User) {
    return this.apiService.post('/users', user);
  }

  postOrgUser(orgUser) {
    return this.apiService.post('/orgusers', orgUser);
  }

  markActive() {
    return this.apiService.post('/orgusers/current/mark_active').pipe(
      switchMap(() => {
        return this.authService.refreshEou();
      })
    );
  }

  // TODO: move to v2
  getCompanyEouc(params: { offset: number, limit: number }) {
    return this.apiService.get('/eous/company', {
      params
    }).pipe(
      map(
        eous => eous.map(eou => this.dataTransformService.unflatten(eou) as ExtendedOrgUser)
      )
    );
  }

  @Cacheable()
  getAllCompanyEouc() {
    return this.getCompanyEouCount().pipe(
      switchMap(res => {
        return range(0, res.count / 50);
      }),
      concatMap(page => {
        return this.getCompanyEouc({ offset: 50 * page, limit: 50 });
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as ExtendedOrgUser[])
    );
  }

  getCompanyEouCount(): Observable<{ count: number }> {
    return this.apiService.get('/eous/company/count').pipe(
      map(
        res => res as { count: number }
      )
    );
  }

  exclude(eous: ExtendedOrgUser[], userIds: string[]) {
    return eous.filter((eou) => {
      return userIds.indexOf(eou.ou.id) === -1;
    });
  }


  // TODO: move to v2
  findDelegatedAccounts() {
    return this.apiService.get('/eous/current/delegated_eous').pipe(
      map(delegatedAccounts => {
        delegatedAccounts = delegatedAccounts.map((delegatedAccount) => {
          return this.dataTransformService.unflatten(delegatedAccount)
        });

        return delegatedAccounts;
      })
    );
  }

  excludeByStatus(eous: ExtendedOrgUser[], status: string) {
    const eousFiltered = eous.filter((eou) => {
      return status.indexOf(eou.ou.status) === -1;
    });
    return eousFiltered;
  }

  filterByRole(eous: ExtendedOrgUser[], role: string) {
    const eousFiltered = eous.filter((eou) => {
      return eou.ou.roles.indexOf(role);
    });

    return eousFiltered;
  }

  filterByRoles(eous: ExtendedOrgUser[], role) {
    const filteredEous = eous.filter(eou => {
      return role.some(userRole => {
        if (eou.ou.roles.indexOf(userRole) > -1) {
          return true;
        }
      });
    });

    return filteredEous;
  }

  switchToDelegator(orgUser) {
    return this.apiService.post('/orgusers/delegator_refresh_token', orgUser).pipe(
      switchMap(data => {
        return this.authService.newRefreshToken(data.refresh_token);
      })
    );
  }

  switchToDelegatee() {
    return this.apiService.post('/orgusers/delegatee_refresh_token').pipe(
      switchMap(data => {
        return this.authService.newRefreshToken(data.refresh_token);
      })
    );
  }

  async isSwitchedToDelegator() {
    const accessToken = this.jwtHelperService.decodeToken(await this.tokenService.getAccessToken());
    return !!accessToken.proxy_org_user_id;
  }

  verifyMobile() {
    return this.apiService.post('/orgusers/verify_mobile');
  };

  checkMobileVerificationCode(otp) {
    return this.apiService.post('/orgusers/check_mobile_verification_code', otp);
  };
}
