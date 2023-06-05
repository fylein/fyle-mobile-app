import { Inject, Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { catchError, concatMap, map, reduce, shareReplay, switchMap, tap } from 'rxjs/operators';
import { from, Observable, of, range, Subject, iif } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiV2Service } from './api-v2.service';
import { DateService } from './date.service';
import { ExtendedReport } from '../models/report.model';
import { isEqual } from 'lodash';
import { DataTransformService } from './data-transform.service';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { TransactionService } from './transaction.service';
import { Datum, StatsResponse } from '../models/v2/stats-response.model';
import { UserEventService } from './user-event.service';
import { ReportAutoSubmissionDetails } from '../models/report-auto-submission-details.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { PAGINATION_SIZE } from 'src/app/constants';
import { PermissionsService } from './permissions.service';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { OrgSettings } from '../models/org-settings.model';
import { Expense } from '../models/expense.model';
import { Approver } from '../models/v1/approver.model';
import { ReportActions } from '../models/report-actions.model';
import { ReportPurpose } from '../models/report-purpose.model';
import { ApiV2Response } from '../models/api-v2.model';
import { ReportParams } from '../models/report-params.model';
import { UnflattenedReport } from '../models/report-unflattened.model';
import { ReportV1 } from '../models/report-v1.model';
import { ReportQueryParams } from '../models/report-api-params.model';
import { PdfExport } from '../models/pdf-exports.model';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private authService: AuthService,
    private apiv2Service: ApiV2Service,
    private dateService: DateService,
    private dataTransformService: DataTransformService,
    private transactionService: TransactionService,
    private userEventService: UserEventService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private datePipe: DatePipe,
    private launchDarklyService: LaunchDarklyService,
    private permissionsService: PermissionsService
  ) {
    reportsCacheBuster$.subscribe(() => {
      this.userEventService.clearTaskCache();
    });
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  clearCache() {
    return of(null);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  clearTransactionCache() {
    return this.transactionService.clearCache();
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$,
  })
  getMyReportsCount(queryParams = {}): Observable<number> {
    return this.getMyReports({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((res) => res.count));
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$,
  })
  getPaginatedERptc(
    offset: number,
    limit: number,
    params: { state?: string[]; order?: string }
  ): Observable<UnflattenedReport[]> {
    const data = {
      params: {
        offset,
        limit,
      },
    };

    Object.keys(params).forEach((param) => {
      data.params[param] = params[param];
    });

    return this.apiService
      .get<UnflattenedReport[]>('/erpts', data)
      .pipe(map((erptcs) => erptcs.map((erptc) => this.dataTransformService.unflatten(erptc))));
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$,
  })
  getERpt(rptId: string) {
    return this.apiService.get('/erpts/' + rptId).pipe(
      map((data) => {
        const erpt = this.dataTransformService.unflatten(data);
        this.dateService.fixDates(erpt.rp);
        if (erpt && erpt.rp && erpt.rp.created_at) {
          erpt.rp.created_at = this.dateService.getLocalDate(erpt.rp.created_at);
        }
        return erpt;
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  addTransactions(rptId: string, txnIds: string[]) {
    return this.apiService
      .post('/reports/' + rptId + '/txns', {
        ids: txnIds,
      })
      .pipe(
        tap(() => {
          this.clearTransactionCache();
        })
      );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  createDraft(report: ReportPurpose) {
    return this.apiService
      .post('/reports', report)
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  create(report: ReportPurpose, txnIds: string[]) {
    return this.createDraft(report).pipe(
      switchMap((newReport: ReportV1) =>
        this.apiService
          .post<ReportV1>('/reports/' + newReport.id + '/txns', { ids: txnIds })
          .pipe(switchMap((res) => this.submit(newReport.id).pipe(map(() => newReport))))
      )
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  removeTransaction(rptId: string, txnId: string, comment?) {
    const aspy = {
      status: {
        comment,
      },
    };
    return this.apiService
      .post('/reports/' + rptId + '/txns/' + txnId + '/remove', aspy)
      .pipe(tap(() => this.clearTransactionCache()));
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  submit(rptId: string) {
    return this.apiService
      .post('/reports/' + rptId + '/submit')
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  resubmit(rptId: string) {
    return this.apiService.post('/reports/' + rptId + '/resubmit');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  inquire(
    rptId: string,
    addStatusPayload: {
      status: {
        comment: string;
      };
      notify: boolean;
    }
  ) {
    return this.apiService.post('/reports/' + rptId + '/inquire', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  approve(rptId: string) {
    return this.apiService.post('/reports/' + rptId + '/approve');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  addApprover(rptId: string, approverEmail: string, comment: string) {
    const data = {
      approver_email: approverEmail,
      comment,
    };
    return this.apiService.post('/reports/' + rptId + '/approvals', data);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  updateReportDetails(erpt: ExtendedReport): Observable<ReportV1> {
    const reportData = this.dataTransformService.unflatten(erpt);
    return this.apiService
      .post<ReportV1>('/reports', reportData.rp)
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$,
  })
  getReportAutoSubmissionDetails(): Observable<ReportAutoSubmissionDetails> {
    return this.spenderPlatformV1ApiService
      .post<ReportAutoSubmissionDetails>('/automations/report_submissions/next_at', {
        data: null,
      })
      .pipe(
        map((res) => {
          if (res.data.next_at) {
            const dateObj = new Date(res.data.next_at);
            res.data.next_at = dateObj;
          }
          return res;
        })
      );
  }

  @Cacheable()
  getReportPermissions(orgSettings: OrgSettings) {
    return this.permissionsService
      .allowedActions('reports', ['approve', 'create', 'delete'], orgSettings)
      .pipe(catchError((err) => []));
  }

  getAutoSubmissionReportName() {
    return this.getReportAutoSubmissionDetails().pipe(
      map((reportAutoSubmissionDetails) => {
        const nextReportAutoSubmissionDate = reportAutoSubmissionDetails.data?.next_at;
        if (nextReportAutoSubmissionDate) {
          return '(Automatic Submission On ' + this.datePipe.transform(nextReportAutoSubmissionDate, 'MMM d') + ')';
        }
        return null;
      })
    );
  }

  getUserReportParams(state: string) {
    const stateMap = {
      draft: {
        state: ['DRAFT', 'DRAFT_INQUIRY'],
      },
      pending: {
        state: ['APPROVER_PENDING'],
      },
      inquiry: {
        state: ['APPROVER_INQUIRY'],
      },
      approved: {
        state: ['APPROVED'],
      },
      payment_queue: {
        state: ['PAYMENT_PENDING'],
      },
      paid: {
        state: ['PAID'],
      },
      edit: {
        state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
      },
      all: {
        state: [
          'DRAFT',
          'DRAFT_INQUIRY',
          'COMPLETE',
          'APPROVED',
          'APPROVER_PENDING',
          'APPROVER_INQUIRY',
          'PAYMENT_PENDING',
          'PAYMENT_PROCESSING',
          'PAID',
          'REJECTED',
        ],
      },
    };

    return stateMap[state];
  }

  getPaginatedERptcCount(params: ReportParams): Observable<{ count: number }> {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline: boolean) => {
        if (isOnline) {
          return this.apiService.get<{ count: number }>('/erpts/count', { params }).pipe(
            tap((res) => {
              this.storageService.set('erpts-count' + JSON.stringify(params), res);
            })
          );
        } else {
          return from(this.storageService.get('erpts-count' + JSON.stringify(params)));
        }
      })
    );
  }

  getMyReports(
    config: Partial<{
      offset: number;
      limit: number;
      order: string;
      queryParams: ReportQueryParams;
    }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ): Observable<ApiV2Response<ExtendedReport>> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiv2Service.get('/reports', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order: `${config.order || 'rp_created_at.desc'},rp_id.desc`,
            rp_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams,
          },
        })
      ),
      map(
        (res) =>
          res as {
            count: number;
            data: ExtendedReport[];
            limit: number;
            offset: number;
            url: string;
          }
      ),
      map((res) => ({
        ...res,
        data: res.data.map((datum) => this.dateService.fixDates(datum)),
      }))
    );
  }

  getTeamReportsCount(queryParams = {}): Observable<number> {
    return this.getTeamReports({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((res) => res.count));
  }

  getTeamReports(
    config: Partial<{ offset: number; limit: number; order: string; queryParams: any }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ): Observable<ApiV2Response<ExtendedReport>> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiv2Service.get('/reports', {
          params: {
            offset: config.offset,
            limit: config.limit,
            approved_by: 'cs.{' + eou.ou.id + '}',
            order: `${config.order || 'rp_created_at.desc'},rp_id.desc`,
            ...config.queryParams,
          },
        })
      ),
      map(
        (res) =>
          res as {
            count: number;
            data: ExtendedReport[];
            limit: number;
            offset: number;
            url: string;
          }
      ),
      map((res) => ({
        ...res,
        data: res.data.map((datum) => this.dateService.fixDates(datum)),
      }))
    );
  }

  getReport(id: string): Observable<ExtendedReport> {
    return this.getMyReports({
      offset: 0,
      limit: 1,
      queryParams: {
        rp_id: `eq.${id}`,
      },
    }).pipe(map((res) => res.data[0]));
  }

  getTeamReport(id: string): Observable<ExtendedReport> {
    return this.getTeamReports({
      offset: 0,
      limit: 1,
      queryParams: {
        rp_id: `eq.${id}`,
      },
    }).pipe(map((res) => res.data[0]));
  }

  actions(rptId: string): Observable<ReportActions> {
    return this.apiService.get('/reports/' + rptId + '/actions');
  }

  getExports(rptId: string): Observable<{ results: PdfExport[] }> {
    return this.apiService.get<{ results: PdfExport[] }>('/reports/' + rptId + '/exports');
  }

  getApproversByReportId(rptId: string): Observable<Approver[]> {
    return this.apiService.get('/reports/' + rptId + '/approvers');
  }

  delete(rptId: string) {
    return this.apiService
      .delete('/reports/' + rptId)
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  downloadSummaryPdfUrl(data: { report_ids: string[]; email: string }) {
    return this.apiService.post('/reports/summary/download', data);
  }

  getAllExtendedReports(
    config: Partial<{ order: string; queryParams: ReportQueryParams }>
  ): Observable<ExtendedReport[]> {
    return this.getMyReportsCount(config.queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) =>
        this.getMyReports({
          offset: this.paginationSize * page,
          limit: this.paginationSize,
          queryParams: config.queryParams,
          order: config.order,
        })
      ),
      map((res) => res.data),
      reduce((acc, curr) => acc.concat(curr), [] as ExtendedReport[])
    );
  }

  addOrderByParams(
    params: {
      state?: string[];
    },
    sortOrder?: string
  ): {
    state?: string[];
    order_by?: string;
  } {
    if (sortOrder) {
      return Object.assign(params, { order_by: sortOrder });
    } else {
      return params;
    }
  }

  searchParamsGenerator(search: { state: string; dateRange?: { from: string; to: string } }, sortOrder?: string) {
    let params = {};

    params = this.userReportsSearchParamsGenerator(params, search);
    params = this.addOrderByParams(params, sortOrder);

    return params;
  }

  userReportsSearchParamsGenerator(
    params: ReportParams,
    search: {
      state: string;
      dateRange?: {
        from?: string;
        to?: string;
      };
    }
  ) {
    const searchParams = this.getUserReportParams(search.state);
    return Object.assign({}, params, searchParams);
  }

  getReportPurpose(reportPurpose: { ids: string[] }): Observable<string> {
    return this.apiService.post<ReportV1>('/reports/purpose', reportPurpose).pipe(map((res) => res.purpose));
  }

  getApproversInBulk(rptIds: string[]) {
    if (!rptIds || rptIds.length === 0) {
      return of([]);
    }
    const count = rptIds.length > this.paginationSize ? rptIds.length / this.paginationSize : 1;
    return range(0, count).pipe(
      map((page) => rptIds.slice(page * this.paginationSize, (page + 1) * this.paginationSize)),
      concatMap((rptIds) => this.apiService.get('/reports/approvers', { params: { report_ids: rptIds } })),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  addApprovers(erpts, approvers) {
    const reportApprovalsMap = {};

    approvers.forEach((approver) => {
      if (reportApprovalsMap[approver.report_id]) {
        reportApprovalsMap[approver.report_id].push(approver);
      } else {
        reportApprovalsMap[approver.report_id] = [approver];
      }
    });

    return erpts.map((erpt) => {
      erpt.rp.approvals = reportApprovalsMap[erpt.rp.id];
      return erpt;
    });
  }

  getReportStatsData(params, defaultOwnStats: boolean = true) {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => {
        const defaultStats = defaultOwnStats ? { rp_org_user_id: `eq.${eou.ou.id}` } : {};
        return this.apiv2Service.get('/reports/stats', {
          params: {
            ...defaultStats,
            ...params,
          },
        });
      }),
      map((rawStatsResponse) => rawStatsResponse.data)
    );
  }

  getFilteredPendingReports(searchParams: { state: string }) {
    const params = this.searchParamsGenerator(searchParams);

    return this.getPaginatedERptcCount(params).pipe(
      switchMap((results) =>
        // getting all results -> offset = 0, limit = count
        this.getPaginatedERptc(0, results.count, params)
      ),
      switchMap((erpts) => {
        const rptIds = erpts.map((erpt) => erpt.rp.id);

        return this.getApproversInBulk(rptIds).pipe(
          map((approvals) =>
            this.addApprovers(erpts, approvals).filter(
              (erpt) =>
                !erpt.rp.approvals ||
                (erpt.rp.approvals && !erpt.rp.approvals.some((approval) => approval.state === 'APPROVAL_DONE'))
            )
          )
        );
      })
    );
  }

  getReportETxnc(rptId: string, orgUserId: string): Observable<Expense[]> {
    const data: any = {
      params: {},
    };

    if (orgUserId) {
      data.params.approver_id = orgUserId;
    }

    return this.apiService.get('/erpts/' + rptId + '/etxns', data);
  }

  getReportStats(params: Partial<StatsResponse>): Observable<StatsResponse> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiv2Service.get('/reports/stats', {
          params: {
            rp_org_user_id: `eq.${eou.ou.id}`,
            ...params,
          },
        })
      ),
      map((rawStatsResponse) => new StatsResponse(rawStatsResponse))
    );
  }
}
