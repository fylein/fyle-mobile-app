import { Inject, Injectable } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { PlatformPerDiemRates } from '../models/platform/platform-per-diem-rates.model';
import { PerDiemRates } from '../models/v1/per-diem-rates.model';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { switchMap, concatMap, tap, map, reduce } from 'rxjs/operators';
import { PAGINATION_SIZE } from 'src/app/constants';
import { OrgUserSettingsService } from './org-user-settings.service';

const perDiemsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PerDiemService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private SpenderPlatformV1BetaApiService: SpenderPlatformV1BetaApiService,
    private orgUserSettingsService: OrgUserSettingsService
  ) {}

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
      reduce((acc, curr) => acc.concat(curr), [] as PerDiemRates[])
    );
  }

  @Cacheable()
  getAllowedPerDiems(allPerDiemRates: PerDiemRates[]): Observable<PerDiemRates[]> {
    return this.orgUserSettingsService.get().pipe(
      map((settings) => {
        let allowedPerDiems = [];

        if (
          settings.per_diem_rate_settings.allowed_per_diem_ids &&
          settings.per_diem_rate_settings.allowed_per_diem_ids.length > 0
        ) {
          const allowedPerDiemIds = settings.per_diem_rate_settings.allowed_per_diem_ids;

          if (allPerDiemRates?.length > 0) {
            allowedPerDiems = allPerDiemRates.filter((perDiem) => allowedPerDiemIds.includes(perDiem.id));
          }
        }

        return allowedPerDiems;
      })
    );
  }

  getRate(id: number): Observable<PerDiemRates> {
    const data = {
      params: {
        id: 'eq.' + id,
      },
    };
    return this.SpenderPlatformV1BetaApiService.get<PlatformApiResponse<PlatformPerDiemRates>>(
      '/per_diem_rates',
      data
    ).pipe(
      map((res) => this.transformFrom(res.data)),
      map((res) => res[0])
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
    return this.SpenderPlatformV1BetaApiService.get<PlatformApiResponse<PlatformPerDiemRates>>(
      '/per_diem_rates',
      data
    ).pipe(map((res) => this.transformFrom(res.data)));
  }

  getActivePerDiemRatesCount(): Observable<number> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };
    return this.SpenderPlatformV1BetaApiService.get<PlatformApiResponse<PlatformPerDiemRates>>(
      '/per_diem_rates',
      data
    ).pipe(map((res) => res.count));
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
