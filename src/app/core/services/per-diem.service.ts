import { Injectable } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { PlatformPerDiemRates } from '../models/platform/platform-per-diem-rates.model';
import { PerDiemRates } from '../models/v1/per-diem-rates.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { switchMap, concatMap, tap, map, reduce } from 'rxjs/operators';

const perDiemsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PerDiemService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

  @Cacheable({
    cacheBusterObserver: perDiemsCacheBuster$,
  })
  getRates(): Observable<PerDiemRates[]> {
    return this.getActivePerDiemRatesCount().pipe(
      switchMap((count) => {
        count = count > 50 ? count / 50 : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getPerDiemRates({ offset: 50 * page, limit: 50 })),
      map((res) => res),
      reduce((acc, curr) => acc.concat(curr), [] as PerDiemRates[])
    );
  }

  getRate(id: number): Observable<PerDiemRates> {
    const data = {
      params: {
        id: 'eq.' + id,
      },
    };
    return this.spenderPlatformApiService.get<PlatformApiResponse<PlatformPerDiemRates>>('/per_diem_rates', data).pipe(
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
    return this.spenderPlatformApiService
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
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformPerDiemRates>>('/per_diem_rates', data)
      .pipe(map((res) => res.count));
  }

  transformFrom(platformPerDiemRates: PlatformPerDiemRates[]): PerDiemRates[] {
    const oldPerDiemRates = platformPerDiemRates.map((perDiemRate) => ({
      active: perDiemRate.is_enabled,
      created_at: perDiemRate.created_at,
      currency: perDiemRate.currency,
      id: perDiemRate.id,
      name: perDiemRate.name,
      org_id: perDiemRate.org_id,
      rate: perDiemRate.rate,
      updated_at: perDiemRate.updated_at,
    }));

    return oldPerDiemRates;
  }
}
