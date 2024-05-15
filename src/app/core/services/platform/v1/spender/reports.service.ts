import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, range } from 'rxjs';
import { concatMap, map, reduce, switchMap, tap } from 'rxjs/operators';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ReportsQueryParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CreateDraftParams } from 'src/app/core/models/platform/v1/create-draft-params.model';
import { PlatformApiPayload } from 'src/app/core/models/platform/platform-api-payload.model';
import { PlatformStatsRequestParams } from 'src/app/core/models/platform/v1/platform-stats-request-param.model';
import { CacheBuster } from 'ts-cacheable';
import { UserEventService } from '../../../user-event.service';
import { TransactionService } from '../../../transaction.service';
import { PlatformReportsStatsResponse } from 'src/app/core/models/platform/v1/report-stats-response.model';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class SpenderReportsService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private userEventService: UserEventService,
    private transactionService: TransactionService
  ) {
    reportsCacheBuster$.subscribe(() => {
      this.userEventService.clearTaskCache();
    });
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  clearTransactionCache(): Observable<null> {
    return this.transactionService.clearCache();
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  ejectExpenses(rptId: string, txnId: string, comment?: string[]): Observable<void> {
    const payload = {
      data: {
        id: rptId,
        expense_ids: [txnId],
      },
      reason: comment,
    };
    return this.spenderPlatformV1ApiService.post<void>('/reports/eject_expenses', payload).pipe(
      tap(() => {
        this.clearTransactionCache();
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  addExpenses(rptId: string, expenseIds: string[]): Observable<void> {
    const payload = {
      data: {
        id: rptId,
        expense_ids: expenseIds,
      },
    };
    return this.spenderPlatformV1ApiService.post<void>('/reports/add_expenses', payload).pipe(
      tap(() => {
        this.clearTransactionCache();
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  createDraft(data: CreateDraftParams): Observable<Report> {
    return this.spenderPlatformV1ApiService.post<PlatformApiPayload<Report>>('/reports', data).pipe(
      tap(() => this.clearTransactionCache()),
      map((res: PlatformApiPayload<Report>) => res.data)
    );
  }

  getAllReportsByParams(queryParams: ReportsQueryParams): Observable<Report[]> {
    return this.getReportsCount(queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => {
        const params = {
          ...queryParams,
          offset: this.paginationSize * page,
          limit: this.paginationSize,
        };

        return this.getReportsByParams(params);
      }),
      reduce((acc, curr) => acc.concat(curr.data), [] as Report[])
    );
  }

  getReportsCount(queryParams: ReportsQueryParams): Observable<number> {
    const params = {
      ...queryParams,
      limit: 1,
      offset: 0,
    };
    return this.getReportsByParams(params).pipe(map((res) => res.count));
  }

  getReportsByParams(queryParams: ReportsQueryParams): Observable<PlatformApiResponse<Report[]>> {
    const config = {
      params: {
        ...queryParams,
      },
    };
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<Report[]>>('/reports', config);
  }

  getReportById(id: string): Observable<Report> {
    const queryParams = { id: `eq.${id}` };
    return this.getReportsByParams(queryParams).pipe(map((res: PlatformApiResponse<Report[]>) => res.data[0]));
  }

  getReportsStats(params: PlatformStatsRequestParams): Observable<PlatformReportsStatsResponse> {
    const queryParams = {
      data: {
        query_params: `state=${params.state}`,
      },
    };
    return this.spenderPlatformV1ApiService
      .post<{ data: PlatformReportsStatsResponse }>('/reports/stats', queryParams)
      .pipe(map((res) => res.data));
  }
}
