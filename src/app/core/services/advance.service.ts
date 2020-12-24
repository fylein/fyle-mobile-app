import { Injectable } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { ExtendedAdvance } from '../models/extended_advance.model';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';

const advancesCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class AdvanceService {

  constructor(
    private apiv2Service: ApiV2Service,
    private authService: AuthService
  ) { }

  getAdvance(id: string): Observable<ExtendedAdvance> {
    return this.apiv2Service.get('/advances', {
      params: {
        adv_id: `eq.${id}`
      }
    }).pipe(
      map(
        res => this.fixDates(res.data[0]) as ExtendedAdvance
      )
    );
  }

  @Cacheable({
    cacheBusterObserver: advancesCacheBuster$
  })
  getMyadvances(config: Partial<{ offset: number, limit: number, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiv2Service.get('/advances', {
          params: {
            offset: config.offset,
            limit: config.limit,
            assignee_ou_id: 'eq.' + eou.ou.id,
            ...config.queryParams
          }
        });
      }),
      map(res => res as {
        count: number,
        data: ExtendedAdvance[],
        limit: number,
        offset: number,
        url: string
      }),
      map(res => ({
        ...res,
        data: res.data.map(this.fixDates)
      }))
    );
  }

  getMyAdvancesCount(queryParams = {}) {
    return this.getMyadvances({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(advances => advances.count)
    );
  }

  fixDates(data: ExtendedAdvance) {
    data.adv_created_at = new Date(data.adv_created_at);
    data.adv_issued_at = new Date(data.adv_issued_at);
    if (data.areq_approved_at) {
      data.areq_approved_at = new Date(data.areq_approved_at);
    }
    return data;
  }
}
