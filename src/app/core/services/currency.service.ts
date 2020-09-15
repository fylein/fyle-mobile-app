import { Injectable } from '@angular/core';
import { OrgService } from './org.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(
    private orgService: OrgService,
    private authService: AuthService,
    private apiService: ApiService
  ) { }

  getHomeCurrency() {
    return this.orgService.getCurrentOrg()
      .pipe(
        map(
          org => org.currency
        )
      );
  }

  getAll() {
    return from(this.authService.getEou())
      .pipe(
        switchMap(
          currentEou => {
            return this.apiService.get('/currency/all', {
              params: {
                org_id: currentEou && currentEou.ou && currentEou.ou.org_id
              }
            });
          }
        )
      );
  }
}
