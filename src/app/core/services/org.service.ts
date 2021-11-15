import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Org } from '../models/org.model';
import { AuthService } from './auth.service';
import { forkJoin, Subject } from 'rxjs';
import { Cacheable, globalCacheBusterNotifier } from 'ts-cacheable';

const orgsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OrgService {
  constructor(private apiService: ApiService, private authService: AuthService) {}

  @Cacheable({
    cacheBusterObserver: orgsCacheBuster$,
  })
  getCurrentOrg() {
    return this.apiService
      .get('/orgs', {
        params: {
          is_current: true,
        },
      })
      .pipe(map((orgs) => orgs[0] as Org));
  }

  @Cacheable({
    cacheBusterObserver: orgsCacheBuster$,
  })
  getPrimaryOrg() {
    return this.apiService.get('/orgs', {
      params: {
        is_primary: true,
      },
    });
  }

  @Cacheable({
    cacheBusterObserver: orgsCacheBuster$,
  })
  getOrgs() {
    return this.apiService.get('/orgs').pipe(map((res) => res as Org[]));
  }

  suggestOrgCurrency() {
    return this.apiService.get('/currency/ip').pipe(
      map((data) => {
        data.currency = data.currency || 'USD';
        return data.currency as string;
      }),
      catchError(() => 'USD')
    );
  }

  updateOrg(org) {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/orgs', org);
  }

  setCurrencyBasedOnIp() {
    const currency$ = this.suggestOrgCurrency();
    const currentOrg$ = this.getCurrentOrg();

    return forkJoin([currency$, currentOrg$]).pipe(
      switchMap((aggregatedResults) => {
        const [currency, org] = aggregatedResults;
        org.currency = currency;
        return this.updateOrg(org);
      })
    );
  }

  switchOrg(orgId: string) {
    // busting global cache
    globalCacheBusterNotifier.next();

    return this.apiService
      .post(`/orgs/${orgId}/refresh_token`)
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }
}
