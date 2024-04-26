import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, from, of, range } from 'rxjs';
import { catchError, concatMap, map, mergeMap, reduce, switchMap, tap } from 'rxjs/operators';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ReportsQueryParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CreateDraftParams } from 'src/app/core/models/platform/v1/create-draft-params.model';
import { PlatformApiPayload } from 'src/app/core/models/platform/platform-api-payload.model';
import { StatsResponse } from 'src/app/core/models/v2/stats-response.model';
import { PlatformStatsRequestParams } from 'src/app/core/models/platform/v1/platform-stats-requesst-param.model';

@Injectable({
  providedIn: 'root',
})
export class SpenderReportsService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService
  ) {}

  getAllReportsByParams(queryParams: ReportsQueryParams, order?: string): Observable<Report[]> {
    return this.getReportsCount(queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => {
        let params = {
          ...queryParams,
          offset: this.paginationSize * page,
          limit: this.paginationSize,
        };

        if (order) {
          params = {
            ...params,
            order,
          };
        }

        return this.getReportsByParams(params);
      }),
      reduce((acc, curr) => acc.concat(curr.data), [] as Report[])
    );
  }

  getReportsCount(queryParams: ReportsQueryParams): Observable<number> {
    let params = {
      state: queryParams.state,
      limit: 1,
      offset: 0,
    };
    return this.getReportsByParams(params).pipe(map((res) => res.count));
  }

  getReportsByParams(queryParams: ReportsQueryParams = {}): Observable<PlatformApiResponse<Report>> {
    console.log(queryParams);
    const config = {
      params: {
        ...queryParams,
      },
    };
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<Report>>('/reports', config);
  }

  getReport(id: string): Observable<Report> {
    console.log({ id: `eq.${id}` });
    return this.getReportsByParams({ id: `eq.${id}` }).pipe(map((res) => res.data[0]));
  }

  createDraft(data: CreateDraftParams): Observable<Report> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiPayload<Report>>('/reports', data)
      .pipe(map((res) => res.data));
  }

  ejectExpenses(rptId: string, txnId: string, comment?: string[]): Observable<void> {
    const payload = {
      data: {
        id: rptId,
        expense_ids: [txnId],
      },
      reason: comment,
    };
    return this.spenderPlatformV1ApiService.post<void>('/reports/eject_expenses', payload);
  }

  getReportsStats(params: PlatformStatsRequestParams): Observable<StatsResponse> {
    return this.spenderPlatformV1ApiService
      .post<{ data: StatsResponse }>('/reports/stats', {
        data: {
          query_params: `state=${params.state}`,
        },
      })
      .pipe(map((res) => res.data));
  }

  addExpenses(rptId: string, txnIds: string[]): Observable<void> {
    const payload = {
      data: {
        id: rptId,
        expense_ids: txnIds,
      },
    };
    return this.spenderPlatformV1ApiService.post<void>('/reports/add_expenses', payload);
  }
}
