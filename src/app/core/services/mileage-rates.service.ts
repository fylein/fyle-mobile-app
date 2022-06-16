import { Injectable } from '@angular/core';
import { Observable, range, Subject } from 'rxjs';
import { PlatformMileageRates } from '../models/platform/platform-mileage-rates.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { switchMap, concatMap, tap, map, reduce } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MileageRatesService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

  getMileageRates(config: { offset: number; limit: number }): Observable<PlatformMileageRates[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformApiService.get<PlatformApiResponse<PlatformMileageRates>>('/mileage_rates', data)
      .pipe(map((res) => res.data));
  }
}
