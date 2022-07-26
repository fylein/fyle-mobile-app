import { Injectable } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { PlatformMileageRates } from '../models/platform/platform-mileage-rates.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { switchMap, concatMap, tap, map, reduce } from 'rxjs/operators';

const mileageRateCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class MileageRatesService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

  @Cacheable({
    cacheBusterObserver: mileageRateCacheBuster$,
  })
  getAllMileageRates(): Observable<PlatformMileageRates[]> {
    return this.getActiveMileageRatesCount().pipe(
      switchMap((count) => {
        count = count > 50 ? count / 50 : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getMileageRates({ offset: 50 * page, limit: 50 })),
      reduce((acc, curr) => acc.concat(curr), [] as PlatformMileageRates[])
    );
  }

  getActiveMileageRatesCount(): Observable<number> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformMileageRates>>('/mileage_rates', data)
      .pipe(map((res) => res.count));
  }

  getMileageRates(config: { offset: number; limit: number }): Observable<PlatformMileageRates[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<PlatformMileageRates>>('/mileage_rates', data)
      .pipe(map((res) => this.excludeNullRates(res.data)));
  }

  excludeNullRates(platformMileageRates: PlatformMileageRates[]): PlatformMileageRates[] {
    const validMileageRates = platformMileageRates.filter((mileageRate) => mileageRate.rate !== null);
    return validMileageRates;
  }
}
