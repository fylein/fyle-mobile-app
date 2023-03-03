import { Inject, Injectable } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-beta-api.service';
import { CostCenter } from '../models/v1/cost-center.model';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { PlatformCostCenter } from '../models/platform/platform-cost-center.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PAGINATION_SIZE } from 'src/app/constants';

const costCentersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CostCentersService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private SpenderPlatformV1ApiService: SpenderPlatformV1ApiService
  ) {}

  @Cacheable({
    cacheBusterObserver: costCentersCacheBuster$,
  })
  getAllActive(): Observable<CostCenter[]> {
    return this.getActiveCostCentersCount().pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getCostCenters({ offset: this.paginationSize * page, limit: this.paginationSize })),
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
    return this.SpenderPlatformV1ApiService.get<PlatformApiResponse<PlatformCostCenter>>('/cost_centers', data).pipe(
      map((res) => res.count)
    );
  }

  getCostCenters(config: { offset: number; limit: number }): Observable<CostCenter[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.SpenderPlatformV1ApiService.get<PlatformApiResponse<PlatformCostCenter>>('/cost_centers', data).pipe(
      map((res) => this.transformFrom(res.data))
    );
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
