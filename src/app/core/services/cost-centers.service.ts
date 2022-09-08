import { Injectable } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { CostCenter } from '../models/v1/cost-center.model';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { PlatformCostCenter } from '../models/platform/platform-cost-center.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

const costCentersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CostCentersService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

  @Cacheable({
    cacheBusterObserver: costCentersCacheBuster$,
  })
  getAllActive(): Observable<CostCenter[]> {
    return this.getActiveCostCentersCount().pipe(
      switchMap((count) => {
        count = count > 200 ? count / 200 : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getCostCenters({ offset: 200 * page, limit: 200 })),
      reduce((acc, curr) => acc.concat(curr), [] as CostCenter[])
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
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformCostCenter>>('/cost_centers', data)
      .pipe(map((res) => res.count));
  }

  getCostCenters(config: { offset: number; limit: number }): Observable<CostCenter[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformCostCenter>>('/cost_centers', data)
      .pipe(map((res) => this.transformFrom(res.data)));
  }

  transformFrom(platformCostCenter: PlatformCostCenter[]): CostCenter[] {
    const oldCostCenter = platformCostCenter.map((costCenter) => ({
      active: costCenter.is_enabled,
      code: costCenter.code,
      created_at: costCenter.created_at,
      description: costCenter.description,
      id: costCenter.id,
      name: costCenter.name,
      org_id: costCenter.org_id,
      updated_at: costCenter.updated_at,
    }));

    return oldCostCenter;
  }
}
