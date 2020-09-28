import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap, map, switchMap, catchError, concatMap } from 'rxjs/operators';
import { Org } from '../models/org.model';
import { AuthService } from './auth.service';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrgService {

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  getCurrentOrg() {
    return this.apiService.get('/orgs', {
      params: {
        is_current: true
      }
    }).pipe(
      map(orgs => orgs[0] as Org)
    );
  }

  suggestOrgCurrency() {
    return this.apiService.get('/currency/ip').pipe(
      map((data) => {
        data.currency = data.currency || 'USD';
        return data.currency as string;
      }),
      catchError(() => {
        return 'USD';
      })
    );
  }

  updateOrg(org) {
    // TODO: Clear all cache
    return this.apiService.post('/orgs', org);
  }

  setCurrencyBasedOnIp() {
    const currency$ = this.suggestOrgCurrency();
    const currentOrg$ = this.getCurrentOrg();

    return forkJoin([
      currency$,
      currentOrg$
    ]).pipe(
      switchMap(
        (aggregatedResults) => {
          const [currency, org] = aggregatedResults;
          org.currency = currency;
          return this.updateOrg(org);
        }
      )
    );
  }

  getOrgs() {
    return this.apiService.get('/orgs').pipe(
      map(res => res as Org[])
    );
  }

  switchOrg(orgId: string) {
    return this.apiService.post(`/orgs/${orgId}/refresh_token`).pipe(
      switchMap(data => {
        return this.authService.newRefreshToken(data.refresh_token);
      })
    );
  }
}
