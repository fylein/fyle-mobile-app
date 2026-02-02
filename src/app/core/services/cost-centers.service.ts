import { Injectable, inject } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { PlatformCostCenter } from '../models/platform/platform-cost-center.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PAGINATION_SIZE } from 'src/app/constants';

const costCentersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CostCentersService {
  private paginationSize = inject(PAGINATION_SIZE);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  @Cacheable({
    cacheBusterObserver: costCentersCacheBuster$,
  })
  getAllActive(): Observable<PlatformCostCenter[]> {
    return this.getActiveCostCentersCount().pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getCostCenters({ offset: this.paginationSize * page, limit: this.paginationSize })),
      reduce((acc, curr) => acc.concat(curr), [] as PlatformCostCenter[]),
    );
  }

  getActiveCostCentersCount(): Observable<number> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCostCenter[]>>('/cost_centers', data)
      .pipe(map((res) => res.count));
  }

  getCostCenters(config: { offset: number; limit: number }): Observable<PlatformCostCenter[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCostCenter[]>>('/cost_centers', data)
      .pipe(map((res) => res.data));
  }
}
