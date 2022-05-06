import { Injectable } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Subject } from 'rxjs';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { CostCenter } from '../models/v1/cost-center.model';
import { PlatformCostCenterData } from '../models/platform/platform-cost-center-data.model';
import { map } from 'rxjs/operators';
import { PlatformCostCenter } from '../models/platform/platform-cost-center.model';

const costCentersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CostCentersService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

  @Cacheable({
    cacheBusterObserver: costCentersCacheBuster$,
  })
  getAllActive() {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
      },
    };
    return this.spenderPlatformApiService
      .get('/cost_centers', data)
      .pipe(map((res: PlatformCostCenter) => this.transformFrom(res.data)));
  }

  transformFrom(platformCostCenter: PlatformCostCenterData[]): CostCenter[] {
    let oldCostCenter = [];
    oldCostCenter = platformCostCenter.map((costCenter) => ({
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
