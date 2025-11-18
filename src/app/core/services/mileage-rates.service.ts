import { Injectable, inject } from '@angular/core';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { PlatformMileageRates } from '../models/platform/platform-mileage-rates.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { CurrencyPipe } from '@angular/common';
import { switchMap, concatMap, map, reduce } from 'rxjs/operators';
import { PAGINATION_SIZE } from 'src/app/constants';
import { TranslocoService } from '@jsverse/transloco';

const mileageRateCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class MileageRatesService {
  private paginationSize = inject(PAGINATION_SIZE);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private approverPlatformV1ApiService = inject(ApproverPlatformApiService);

  private currencyPipe = inject(CurrencyPipe);

  private translocoService = inject(TranslocoService);

  @Cacheable({
    cacheBusterObserver: mileageRateCacheBuster$,
  })
  getAllMileageRates(): Observable<PlatformMileageRates[]> {
    return this.getAllMileageRatesCount().pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getMileageRates({ offset: this.paginationSize * page, limit: this.paginationSize })),
      reduce((acc, curr) => acc.concat(curr), [] as PlatformMileageRates[]),
    );
  }

  @Cacheable({
    cacheBusterObserver: mileageRateCacheBuster$,
  })
  getSpenderMileageRateById(id: number): Observable<PlatformMileageRates> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformMileageRates[]>>('/mileage_rates', data)
      .pipe(map((response) => response.data[0]));
  }

  @Cacheable({
    cacheBusterObserver: mileageRateCacheBuster$,
  })
  getApproverMileageRateById(id: number): Observable<PlatformMileageRates> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.approverPlatformV1ApiService
      .get<PlatformApiResponse<PlatformMileageRates[]>>('/mileage_rates', data)
      .pipe(map((response) => response.data[0]));
  }

  getAllMileageRatesCount(): Observable<number> {
    const data = {
      params: {
        offset: 0,
        limit: 1,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformMileageRates[]>>('/mileage_rates', data)
      .pipe(map((res) => res.count));
  }

  getMileageRates(config: { offset: number; limit: number }): Observable<PlatformMileageRates[]> {
    const data = {
      params: {
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformMileageRates[]>>('/mileage_rates', data)
      .pipe(map((res) => this.excludeNullRates(res.data)));
  }

  excludeNullRates(platformMileageRates: PlatformMileageRates[]): PlatformMileageRates[] {
    const validMileageRates = platformMileageRates.filter((mileageRate) => mileageRate.rate !== null);
    return validMileageRates;
  }

  formatMileageRateName(rateName: string): string {
    const names: Record<string, string> = {
      two_wheeler: this.translocoService.translate('services.mileageRates.twoWheeler'),
      four_wheeler: this.translocoService.translate('services.mileageRates.fourWheelerType1'),
      four_wheeler1: this.translocoService.translate('services.mileageRates.fourWheelerType2'),
      four_wheeler3: this.translocoService.translate('services.mileageRates.fourWheelerType3'),
      four_wheeler4: this.translocoService.translate('services.mileageRates.fourWheelerType4'),
      bicycle: this.translocoService.translate('services.mileageRates.bicycle'),
      electric_car: this.translocoService.translate('services.mileageRates.electricCar'),
    };

    return rateName && names[rateName] ? names[rateName] : rateName;
  }

  getReadableRate(rate: number, currency: string, unit: string): string {
    unit =
      unit && unit.toLowerCase() === 'miles'
        ? this.translocoService.translate('services.mileageRates.mile')
        : this.translocoService.translate('services.mileageRates.km');

    return this.currencyPipe.transform(rate, currency, 'symbol', '1.2-2') + '/' + unit;
  }

  filterEnabledMileageRates(allMileageRates: PlatformMileageRates[]): PlatformMileageRates[] {
    return allMileageRates.filter((rate) => !!rate.is_enabled);
  }
}
