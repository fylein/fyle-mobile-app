import { Injectable, inject } from '@angular/core';
import { Observable, Subject, range } from 'rxjs';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { PAGINATION_SIZE } from 'src/app/constants';
import { Cacheable } from 'ts-cacheable';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformPerDiemRates } from '../models/platform/platform-per-diem-rates.model';
import { PerDiemRates } from '../models/v1/per-diem-rates.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { EmployeeSettings } from '../models/employee-settings.model';

const perDiemsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PerDiemService {
  private paginationSize = inject(PAGINATION_SIZE);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  @Cacheable({
    cacheBusterObserver: perDiemsCacheBuster$,
  })
  getRates(): Observable<PerDiemRates[]> {
    return this.getActivePerDiemRatesCount().pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getPerDiemRates({ offset: this.paginationSize * page, limit: this.paginationSize })),
      reduce((acc, curr) => acc.concat(curr), [] as PerDiemRates[]),
    );
  }

  @Cacheable()
  getAllowedPerDiems(allPerDiemRates: PerDiemRates[]): Observable<PerDiemRates[]> {
    return this.platformEmployeeSettingsService.get().pipe(
      map((settings: EmployeeSettings) => {
        let allowedPerDiems: PerDiemRates[] = [];

        if (settings.per_diem_rate_ids && settings.per_diem_rate_ids.length > 0) {
          const allowedPerDiemIds = settings.per_diem_rate_ids.map((id) => Number(id));

          if (allPerDiemRates?.length > 0) {
            allowedPerDiems = allPerDiemRates.filter((perDiem) => allowedPerDiemIds.includes(perDiem.id));
          }
        }

        return allowedPerDiems;
      }),
    );
  }

  getRate(id: number): Observable<PerDiemRates> {
    const data = {
      params: {
        id: 'eq.' + id,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformPerDiemRates[]>>('/per_diem_rates', data)
      .pipe(
        map((res) => this.transformFrom(res.data)),
        map((res) => res[0]),
      );
  }

  getPerDiemRates(config: { offset: number; limit: number }): Observable<PerDiemRates[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformPerDiemRates[]>>('/per_diem_rates', data)
      .pipe(map((res) => this.transformFrom(res.data)));
  }

  getActivePerDiemRatesCount(): Observable<number> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformPerDiemRates[]>>('/per_diem_rates', data)
      .pipe(map((res) => res.count));
  }

  transformFrom(platformPerDiemRates: PlatformPerDiemRates[]): PerDiemRates[] {
    const oldPerDiemRates = platformPerDiemRates.map((perDiemRate) => ({
      active: perDiemRate.is_enabled,
      created_at: new Date(perDiemRate.created_at),
      currency: perDiemRate.currency,
      id: perDiemRate.id,
      name: perDiemRate.name,
      org_id: perDiemRate.org_id,
      rate: perDiemRate.rate,
      updated_at: new Date(perDiemRate.updated_at),
    }));

    return oldPerDiemRates;
  }
}
