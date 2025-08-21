import { inject, Injectable } from '@angular/core';
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
import { ReportPermissions } from 'src/app/core/models/report-permissions.model';
import { Comment } from 'src/app/core/models/platform/v1/comment.model';
import { ReportPurpose } from 'src/app/core/models/report-purpose.model';
import { ExportPayload } from 'src/app/core/models/platform/export-payload.model';
import { GroupedReportStats } from 'src/app/core/models/platform/v1/grouped-report-stats.model';
import { expensesCacheBuster$ } from 'src/app/core/cache-buster/expense-cache-buster';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class SpenderReportsService {
  private paginationSize = inject(PAGINATION_SIZE);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private userEventService = inject(UserEventService);

  private transactionService = inject(TransactionService);

  constructor() {
    reportsCacheBuster$.subscribe(() => {
      this.userEventService.clearTaskCache();
    });
  }

  private paginationSize: number = inject(PAGINATION_SIZE);

  private transactionService: TransactionService = inject(TransactionService);

  private spenderPlatformV1ApiService: SpenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private userEventService: UserEventService = inject(UserEventService);

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  clearTransactionCache(): Observable<null> {
    return this.transactionService.clearCache();
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  create(report: ReportPurpose, expenseIds: string[]): Observable<Report> {
    return this.createDraft({ data: report }).pipe(
      switchMap((newReport: Report) => {
        const payload = {
          data: {
            id: newReport.id,
            expense_ids: expenseIds,
          },
        };
        return this.spenderPlatformV1ApiService
          .post<Report>('/reports/add_expenses', payload)
          .pipe(switchMap(() => this.submit(newReport.id).pipe(map(() => newReport))));
      }),
    );
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
      }),
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
      }),
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  createDraft(data: CreateDraftParams): Observable<Report> {
    return this.spenderPlatformV1ApiService.post<PlatformApiPayload<Report>>('/reports', data).pipe(
      tap(() => this.clearTransactionCache()),
      map((res: PlatformApiPayload<Report>) => res.data),
    );
  }

  permissions(id: string): Observable<ReportPermissions> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiPayload<ReportPermissions>>('/reports/permissions', { data: { id } })
      .pipe(map((res) => res.data));
  }

  postComment(id: string, comment: string): Observable<Comment> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiPayload<Comment>>('/reports/comments', { data: { id, comment } })
      .pipe(map((res) => res.data));
  }

  suggestPurpose(expenseIds: string[]): Observable<string> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiPayload<{ purpose: string }>>('/reports/suggest_purpose', { data: { expense_ids: expenseIds } })
      .pipe(map((res) => res.data.purpose));
  }

  @CacheBuster({
    cacheBusterNotifier: expensesCacheBuster$,
  })
  delete(id: string): Observable<void> {
    return this.spenderPlatformV1ApiService.post<void>('/reports/delete/bulk', { data: [{ id }] });
  }

  submit(reportId: string): Observable<void> {
    return this.spenderPlatformV1ApiService.post<void>('/reports/submit', { data: { id: reportId } });
  }

  export(reportId: string, email: string): Observable<void> {
    const payload: ExportPayload = {
      query_params: `id=in.[${reportId}]`,
      notify_emails: [email],
      config: {
        type: 'pdf',
        include_receipts: true,
      },
    };
    return this.spenderPlatformV1ApiService.post<void>('/reports/exports', { data: payload });
  }

  resubmit(reportId: string): Observable<void> {
    return this.spenderPlatformV1ApiService.post<void>('/reports/resubmit', { data: { id: reportId } });
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
      reduce((acc, curr) => acc.concat(curr.data), [] as Report[]),
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

  getGroupedReportsStats(): Observable<GroupedReportStats[]> {
    const queryParams = {
      data: {
        query_params: 'group_by_state=eq.true',
      },
    };
    return this.spenderPlatformV1ApiService
      .post<{ data: GroupedReportStats[] }>('/reports/stats', queryParams)
      .pipe(map((res) => res.data));
  }
}
