import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, concatMap, map, of, range, reduce, switchMap } from 'rxjs';
import { SpenderService } from '../spender/spender.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { AdvanceWallet } from 'src/app/core/models/platform/v1/advance-wallet.model';
import { APIQueryParams } from 'src/app/core/models/platform/v1/query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CacheBuster, Cacheable } from 'ts-cacheable';
const advanceWalletsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class AdvanceWalletsService {
  constructor(@Inject(PAGINATION_SIZE) private paginationSize: number, private spenderService: SpenderService) {}

  @CacheBuster({
    cacheBusterNotifier: advanceWalletsCacheBuster$,
    isInstant: true,
  })
  clearCache(): Observable<null> {
    return of(null);
  }

  @Cacheable({
    cacheBusterObserver: advanceWalletsCacheBuster$,
  })
  getAllAdvanceWallets(): Observable<AdvanceWallet[]> {
    return this.getAdvanceWalletsCount({}).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) =>
        this.getAdvanceWallets({
          offset: this.paginationSize * page,
          limit: this.paginationSize,
          order: 'created_at.desc,id.desc',
        })
      ),
      reduce((acc, curr) => acc.concat(curr), [] as AdvanceWallet[])
    );
  }

  getAdvanceWalletsCount(params: APIQueryParams): Observable<number> {
    return this.spenderService
      .get<PlatformApiResponse<AdvanceWallet>>('/advance_wallets', { params })
      .pipe(map((response) => response.count));
  }

  getAdvanceWallets(params: APIQueryParams): Observable<AdvanceWallet[]> {
    return this.spenderService
      .get<PlatformApiResponse<AdvanceWallet>>('/advance_wallets', { params })
      .pipe(map((advanceWallets) => advanceWallets.data));
  }
}
