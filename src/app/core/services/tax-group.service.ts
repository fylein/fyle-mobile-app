import { Injectable } from '@angular/core';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { TaxGroup } from '../models/tax-group.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformTaxGroup } from '../models/platform/platform-tax-group.model';
import { Observable, range } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TaxGroupService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

  getEnabledTaxGroupsCount(): Observable<number> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformTaxGroup>>('/tax_groups', data)
      .pipe(map((res) => res.count));
  }

  getTaxGroups(config: { offset: number; limit: number }): Observable<TaxGroup[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformTaxGroup>>('/tax_groups', data)
      .pipe(map((res) => this.transformFrom(res.data)));
  }

  transformFrom(platformTaxGroup: PlatformTaxGroup[]): TaxGroup[] {
    const oldTaxGroup = platformTaxGroup.map((taxGroup) => ({
      id: taxGroup.id,
      name: taxGroup.name,
      percentage: taxGroup.percentage,
      created_at: taxGroup.created_at,
      updated_at: taxGroup.updated_at,
      org_id: taxGroup.org_id,
      is_enabled: taxGroup.is_enabled,
    }));

    return oldTaxGroup;
  }

  get(): Observable<TaxGroup[]> {
    return this.getEnabledTaxGroupsCount().pipe(
      switchMap((count) => {
        count = count > 50 ? count / 50 : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getTaxGroups({ offset: 50 * page, limit: 50 })),
      reduce((acc, curr) => acc.concat(curr), [] as TaxGroup[])
    );
  }
}
