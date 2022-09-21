import { Injectable } from '@angular/core';
import { switchMap, of, Observable } from 'rxjs';
import { Cacheable } from 'ts-cacheable';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { NetworkService } from './network.service';
import { OrgUserService } from './org-user.service';

@Injectable({
  providedIn: 'root',
})
export class DelegatedAccountsService {
  constructor(private networkService: NetworkService, private orgUserService: OrgUserService) {}

  @Cacheable()
  getDelegatedAccounts(): Observable<ExtendedOrgUser[]> {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.orgUserService.findDelegatedAccounts();
        } else {
          return of(null);
        }
      })
    );
  }
}
