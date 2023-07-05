import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Org } from '../models/org.model';
import { AuthService } from './auth.service';
import { forkJoin, Observable, Subject } from 'rxjs';
import { Cacheable, globalCacheBusterNotifier } from 'ts-cacheable';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { CurrencyIp } from '../models/currency-ip.model';
import { AuthResponse } from '../models/auth-response.model';

const orgsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OrgService {
  constructor(private apiService: ApiService, private authService: AuthService) {}

  @Cacheable({
    cacheBusterObserver: orgsCacheBuster$,
  })
  getCurrentOrg(): Observable<Org> {
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
  getPrimaryOrg(): Observable<Org> {
    return this.apiService.get('/orgs', {
      params: {
        is_primary: true,
      },
    });
  }

  @Cacheable({
    cacheBusterObserver: orgsCacheBuster$,
  })
  getOrgs(): Observable<Org[]> {
    return this.apiService.get('/orgs').pipe(map((res) => res as Org[]));
  }

  suggestOrgCurrency(): Observable<string> {
    return this.apiService.get<CurrencyIp>('/currency/ip').pipe(
      map((data) => {
        data.currency = data.currency || 'USD';
        return data.currency;
      }),
      catchError(() => 'USD')
    );
  }

  updateOrg(org: Org): Observable<Org> {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/orgs', org);
  }

  setCurrencyBasedOnIp(): Observable<Org> {
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

  switchOrg(orgId: string): Observable<ExtendedOrgUser> {
    // busting global cache
    globalCacheBusterNotifier.next();

    return this.apiService
      .post<AuthResponse>(`/orgs/${orgId}/refresh_token`)
      .pipe(switchMap((data) => this.authService.newRefreshToken(data.refresh_token)));
  }
}
