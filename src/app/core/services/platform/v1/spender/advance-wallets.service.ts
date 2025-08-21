import { Injectable, inject } from '@angular/core';
import { Observable, concatMap, map, range, reduce, switchMap } from 'rxjs';
import { SpenderService } from '../spender/spender.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { AdvanceWallet } from 'src/app/core/models/platform/v1/advance-wallet.model';
import { APIQueryParams } from 'src/app/core/models/platform/v1/query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';

@Injectable({
  providedIn: 'root',
})
export class AdvanceWalletsService {
  private paginationSize = inject(PAGINATION_SIZE);

  private spenderService = inject(SpenderService);

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
        }),
      ),
      reduce((acc, curr) => acc.concat(curr), [] as AdvanceWallet[]),
    );
  }

  getAdvanceWalletsCount(params: APIQueryParams): Observable<number> {
    return this.spenderService
      .get<PlatformApiResponse<AdvanceWallet[]>>('/advance_wallets', { params })
      .pipe(map((response) => response.count));
  }

  getAdvanceWallets(params: APIQueryParams): Observable<AdvanceWallet[]> {
    return this.spenderService
      .get<PlatformApiResponse<AdvanceWallet[]>>('/advance_wallets', { params })
      .pipe(map((advanceWallets) => advanceWallets.data));
  }
}
