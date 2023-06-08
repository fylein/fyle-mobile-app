import { Injectable } from '@angular/core';
import { from, Observable, of, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { ApiV2Response } from '../models/api-v2.model';
import { ExtendedAdvance } from '../models/extended_advance.model';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';

const advancesCacheBuster$ = new Subject<void>();

type Config = Partial<{ offset: number; limit: number; assignee_ou_id?: string; queryParams: Record<string, string> }>;

@Injectable({
  providedIn: 'root',
})
export class AdvanceService {
  constructor(private apiv2Service: ApiV2Service, private authService: AuthService) {}

  @Cacheable({
    cacheBusterObserver: advancesCacheBuster$,
  })
  getMyadvances(
    config: Config = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ): Observable<ApiV2Response<ExtendedAdvance>> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiv2Service.get<
          ExtendedAdvance,
          {
            params: Config;
          }
        >('/advances', {
          params: {
            offset: config.offset,
            limit: config.limit,
            assignee_ou_id: 'eq.' + eou.ou.id,
            ...config.queryParams,
          },
        })
      ),
      map((res) => res as ApiV2Response<ExtendedAdvance>),
      map((res) => ({
        ...res,
        data: res.data.map(this.fixDates),
      }))
    );
  }

  @CacheBuster({
    cacheBusterNotifier: advancesCacheBuster$,
  })
  destroyAdvancesCacheBuster() {
    return of(null);
  }

  getAdvance(id: string): Observable<ExtendedAdvance> {
    return this.apiv2Service
      .get<ExtendedAdvance, { params: { adv_id: string } }>('/advances', {
        params: {
          adv_id: `eq.${id}`,
        },
      })
      .pipe(map((res) => this.fixDates(res.data[0]) as ExtendedAdvance));
  }

  getMyAdvancesCount(queryParams = {}) {
    return this.getMyadvances({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((advances) => advances.count));
  }

  private fixDates(data: ExtendedAdvance) {
    if (data && data.adv_created_at) {
      data.adv_created_at = new Date(data.adv_created_at);
    }

    if (data && data.adv_issued_at) {
      data.adv_issued_at = new Date(data.adv_issued_at);
    }

    if (data && data.areq_approved_at) {
      data.areq_approved_at = new Date(data.areq_approved_at);
    }
    return data;
  }
}
