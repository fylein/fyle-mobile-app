import { Inject, Injectable } from '@angular/core';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { TaxGroup } from '../models/tax-group.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformTaxGroup } from '../models/platform/platform-tax-group.model';
import { Observable, range } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PAGINATION_SIZE } from 'src/app/constants';
@Injectable({
  providedIn: 'root',
})
export class TaxGroupService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderPlatformApiService: SpenderPlatformApiService
  ) {}

  get(): Observable<TaxGroup[]> {
    return this.getEnabledTaxGroupsCount().pipe(
      switchMap((count) => {
        count = count >= this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getTaxGroups({ offset: this.paginationSize * page, limit: this.paginationSize })),
      reduce((acc, curr) => acc.concat(curr), [] as TaxGroup[])
    );
  }

  private getEnabledTaxGroupsCount(): Observable<number> {
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

  private getTaxGroups(config: { offset: number; limit: number }): Observable<TaxGroup[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformApiService.get<PlatformApiResponse<PlatformTaxGroup>>('/tax_groups', data).pipe(
      map((res) => this.transformFrom(res.data)),
      map((res) =>
        res.map((data) => ({
          ...data,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        }))
      )
    );
  }

  private transformFrom(platformTaxGroup: PlatformTaxGroup[]): TaxGroup[] {
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
}
