import { Inject, Injectable } from '@angular/core';
import { Observable, concatMap, map, range, reduce, switchMap } from 'rxjs';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ReportsQueryParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { PlatformStatsRequestParams } from 'src/app/core/models/platform/v1/platform-stats-request-param.model';
import { PlatformReportsStatsResponse } from 'src/app/core/models/platform/v1/report-stats-response.model';
import { PlatformApiPayload } from 'src/app/core/models/platform/platform-api-payload.model';
import { ReportPermissions } from 'src/app/core/models/report-permissions.model';
import { Comment } from 'src/app/core/models/platform/v1/comment.model';

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
    return this.approverPlatformApiService.get<PlatformApiResponse<Report[]>>('/reports', config);
  }

  generateStatsQueryParams(params: PlatformStatsRequestParams): string {
    const paramKeys = Object.keys(params);
    const queryParams = [];
    paramKeys.forEach((key) => {
      queryParams.push(`${key}=${params[key]}`);
    });

    return queryParams.join('&');
  }

  getReportsStats(params: PlatformStatsRequestParams): Observable<PlatformReportsStatsResponse> {
    return this.approverPlatformApiService
      .post<{ data: PlatformReportsStatsResponse }>('/reports/stats', {
        data: {
          query_params: this.generateStatsQueryParams(params),
        },
      })
      .pipe(map((res) => res.data));
  }

  getReportById(id: string): Observable<Report> {
    const queryParams = { id: `eq.${id}` };
    return this.getReportsByParams(queryParams).pipe(map((res: PlatformApiResponse<Report[]>) => res.data[0]));
  }

  sendBack(id: string, comment: string): Observable<void> {
    return this.approverPlatformApiService.post('/reports/send_back', { data: { id, comment } });
  }

  addApprover(rptId: string, approverEmail: string, comment: string): Observable<void> {
    const data = {
      id: rptId,
      approver_email: approverEmail,
      comment,
    };

    return this.approverPlatformApiService.post('/reports/add_approver', { data });
  }

  permissions(id: string): Observable<ReportPermissions> {
    return this.approverPlatformApiService
      .post<PlatformApiPayload<ReportPermissions>>('/reports/permissions', { data: { id } })
      .pipe(map((res) => res.data));
  }

  postComment(id: string, comment: string): Observable<Comment> {
    return this.approverPlatformApiService
      .post<PlatformApiPayload<Comment>>('/reports/comments', { data: { id, comment } })
      .pipe(map((res) => res.data));
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
