import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { JwtHelperService } from './jwt-helper.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { DataTransformService } from './data-transform.service';
import { switchMap, map, tap, concatMap } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrgUserService {

  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private authService: AuthService
  ) { }

  postUser(user: User) {
    return this.apiService.post('/users', user);
  }

  markActive() {
    return this.apiService.post('/orgusers/current/mark_active').pipe(
      switchMap(() => {
        return this.authService.refreshEou();
      })
    );
  };

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

  async isSwitchedToDelegator() {
    const accessToken = this.jwtHelperService.decodeToken(await this.tokenService.getAccessToken());
    return !!accessToken.proxy_org_user_id;
  }

}
