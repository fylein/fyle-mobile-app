import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { JwtHelperService } from './jwt-helper.service';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { DataTransformService } from './data-transform.service';
import { map, tap } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';

@Injectable({
  providedIn: 'root'
})
export class OrgUserService {

  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
  ) { }

  findDelegatedAccounts () {
    return this.apiService.get('/eous/current/delegated_eous').pipe(
      map(delegatedAccounts => {
        delegatedAccounts = delegatedAccounts.map((delegatedAccount) => {
          return this.dataTransformService.unflatten(delegatedAccount)
        });

        return delegatedAccounts;
      })
    )
  };

  excludeByStatus(eous: ExtendedOrgUser[], status: string) {
    console.log(eous);
    console.log(status);
    let eousFiltered = eous.filter(function (eou) {
      return status.indexOf(eou.ou.status) === -1;
    });
    return eousFiltered;

  }

  isSwitchedToDelegator() {
    // var accessToken = this.jwtHelperService.decodeToken(await this.tokenService.getAccessToken());
    // return !!accessToken.proxy_org_user_id;
    console.log("??????????????????")

    return from(this.tokenService.getAccessToken()).pipe(
      tap(console.log),
      map(accessToken => {
        console.log(accessToken);
          // if (accessToken) {
          //   debugger;
          //   const tokenPayload = this.jwtHelperService.decodeToken(accessToken);
          //   const roles = tokenPayload.roles;
          //   return roles;
          // } else {
          //   return [];
          // }
        }
      )
    );
  }
}
