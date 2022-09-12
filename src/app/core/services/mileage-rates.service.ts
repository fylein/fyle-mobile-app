import { Injectable } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { PlatformMileageRates } from '../models/platform/platform-mileage-rates.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { CurrencyPipe } from '@angular/common';
import { switchMap, concatMap, tap, map, reduce } from 'rxjs/operators';

const mileageRateCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class MileageRatesService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService, private currencyPipe: CurrencyPipe) {}

  @Cacheable({
    cacheBusterObserver: mileageRateCacheBuster$,
  })
  getAllMileageRates(): Observable<PlatformMileageRates[]> {
    return this.getAllMileageRatesCount().pipe(
      switchMap((count) => {
        count = count > 50 ? count / 50 : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getMileageRates({ offset: 50 * page, limit: 50 })),
      reduce((acc, curr) => acc.concat(curr), [] as PlatformMileageRates[])
    );
  }

  getAllMileageRatesCount(): Observable<number> {
    const data = {
      params: {
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

  formatMileageRateName(rateName: string) {
    const names = {
      two_wheeler: 'Two Wheeler',
      four_wheeler: 'Four Wheeler - Type 1',
      four_wheeler1: 'Four Wheeler - Type 2',
      four_wheeler3: 'Four Wheeler - Type 3',
      four_wheeler4: 'Four Wheeler - Type 4',
      bicycle: 'Bicycle',
      electric_car: 'Electric Car',
    };

    return rateName && names[rateName] ? names[rateName] : rateName;
  }

  getReadableRate(rate: number, currency: string, unit: string) {
    unit = unit && unit.toLowerCase() === 'miles' ? 'mile' : 'km';

    return this.currencyPipe.transform(rate, currency, 'symbol', '1.2-2') + '/' + unit;
  }
}
