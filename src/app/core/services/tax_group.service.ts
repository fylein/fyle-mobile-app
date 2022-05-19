import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { TaxGroup } from '../models/tax_group.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformTaxGroup } from '../models/platform/platform-tax-group.model';
import { PlatformTaxGroupData } from '../models/platform/platform-tax-group-data.model';
import { Observable, range } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaxGroupService {
  constructor(private apiService: ApiService, private spenderPlatformApiService: SpenderPlatformApiService) {}

  getEnabledTaxGroupsCount(): Observable<number> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };
    return this.spenderPlatformApiService.get('/tax_groups', data).pipe(map((res: PlatformTaxGroup) => res.count));
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
      .get('/tax_groups', data)
      .pipe(map((res: PlatformTaxGroup) => this.transformFrom(res.data)));
  }

  transformFrom(platformTaxGroup: PlatformTaxGroupData[]): TaxGroup[] {
    let oldTaxGroup = [];
    oldTaxGroup = platformTaxGroup.map((taxGroup) => ({
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
      map((res) => res),
      reduce((acc, curr) => acc.concat(curr), [] as any[])
    );
  }

  post(taxGroup: TaxGroup) {
    /** Only these fields will be of type text & custom fields */
    return this.apiService.post('tax_groups', taxGroup);
  }
}
