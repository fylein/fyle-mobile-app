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
    oldCostCenter = platformCostCenter.map((res) => {
      return {
        active: res.is_enabled,
        code: res.code,
        created_at: res.created_at,
        description: res.description,
        id: res.id,
        name: res.name,
        org_id: res.org_id,
        updated_at: res.updated_at,
      };
    });

    return oldCostCenter;
  }
}
