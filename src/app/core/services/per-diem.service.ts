import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, range } from 'rxjs';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { PAGINATION_SIZE } from 'src/app/constants';
import { Cacheable } from 'ts-cacheable';
import { OrgUserSettings } from '../models/org_user_settings.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformPerDiemRates } from '../models/platform/platform-per-diem-rates.model';
import { PerDiemRates } from '../models/v1/per-diem-rates.model';
import { OrgUserSettingsService } from './org-user-settings.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

const perDiemsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PerDiemService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private orgUserSettingsService: OrgUserSettingsService,
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
      reduce((acc, curr) => acc.concat(curr), [] as PerDiemRates[]),
    );
  }

  @Cacheable()
  getAllowedPerDiems(allPerDiemRates: PerDiemRates[]): Observable<PerDiemRates[]> {
    return this.orgUserSettingsService.get().pipe(
      map((settings: OrgUserSettings) => {
        let allowedPerDiems: PerDiemRates[] = [];

        if (
          settings.per_diem_rate_settings.allowed_per_diem_ids &&
          settings.per_diem_rate_settings.allowed_per_diem_ids.length > 0
        ) {
          const allowedPerDiemIds = settings.per_diem_rate_settings.allowed_per_diem_ids as number[];

          if (allPerDiemRates?.length > 0) {
            allowedPerDiems = allPerDiemRates.filter((perDiem) => allowedPerDiemIds.includes(perDiem.id as never));
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
      .get<PlatformApiResponse<PlatformPerDiemRates>>('/per_diem_rates', data)
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
      .get<PlatformApiResponse<PlatformPerDiemRates>>('/per_diem_rates', data)
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
      .get<PlatformApiResponse<PlatformPerDiemRates>>('/per_diem_rates', data)
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
