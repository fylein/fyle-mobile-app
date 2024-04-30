import { Inject, Injectable } from '@angular/core';
import { Observable, concatMap, map, range, reduce, switchMap } from 'rxjs';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ReportsQueryParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { PlatformStatsRequestParams } from 'src/app/core/models/platform/v1/platform-stats-request-param.model';
import { StatsResponse } from 'src/app/core/models/platform/v1/stats-response.model';

@Injectable({
  providedIn: 'root',
})
export class ApproverReportsService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private approverPlatformApiService: ApproverPlatformApiService
  ) {}

  getAllReportsByParams(queryParams: ReportsQueryParams): Observable<Report[]> {
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
    const config = {
      params: {
        ...queryParams,
      },
    };
    return this.approverPlatformApiService.get<PlatformApiResponse<Report>>('/reports', config);
  }

  getReportsStats(params: PlatformStatsRequestParams): Observable<StatsResponse> {
    const queryParams = {
      data: {
        query_params: `state=${params.state}`,
      },
    };
    return this.approverPlatformApiService
      .post<{ data: StatsResponse }>('/reports/stats', queryParams)
      .pipe(map((res) => res.data));
  }

  getReport(id: string): Observable<Report> {
    const queryParams = { id: `eq.${id}` };
    return this.getReportsByParams(queryParams).pipe(map((res) => res.data[0]));
  }

  ejectExpenses(rptId: string, expenseId: string, comment?: string[]): Observable<void> {
    const payload = {
      data: {
        id: rptId,
        expense_ids: [expenseId],
      },
      reason: comment,
    };
    return this.approverPlatformApiService.post<void>('/reports/eject_expenses', payload);
  }
}
