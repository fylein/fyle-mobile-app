import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { concatMap, map, reduce, shareReplay, switchMap, tap } from 'rxjs/operators';
import { from, of, range, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiV2Service } from './api-v2.service';
import { DateService } from './date.service';
import { ExtendedReport } from '../models/report.model';
import { OfflineService } from 'src/app/core/services/offline.service';
import { isEqual } from 'lodash';
import { DataTransformService } from './data-transform.service';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { TransactionService } from './transaction.service';
import { StatsResponse } from '../models/v2/stats-response.model';
import { UserEventService } from './user-event.service';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private authService: AuthService,
    private apiv2Service: ApiV2Service,
    private dateService: DateService,
    private dataTransformService: DataTransformService,
    private transactionService: TransactionService,
    private userEventService: UserEventService
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
  getMyReportsCount(queryParams = {}) {
    return this.getMyReports({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((res) => res.count));
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$,
  })
  getPaginatedERptc(offset, limit, params) {
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
      .get('/erpts', data)
      .pipe(map((erptcs) => erptcs.map((erptc) => this.dataTransformService.unflatten(erptc))));
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$,
  })
  getERpt(rptId) {
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
  addTransactions(rptId, txnIds) {
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
  createDraft(report) {
    return this.apiService
      .post('/reports', report)
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  create(report, txnIds) {
    return this.createDraft(report).pipe(
      switchMap((newReport) =>
        this.apiService
          .post('/reports/' + newReport.id + '/txns', { ids: txnIds })
          .pipe(switchMap((res) => this.submit(newReport.id).pipe(map(() => newReport))))
      )
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  removeTransaction(rptId, txnId, comment?) {
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
  submit(rptId) {
    return this.apiService
      .post('/reports/' + rptId + '/submit')
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  resubmit(rptId) {
    return this.apiService.post('/reports/' + rptId + '/resubmit');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  inquire(rptId, addStatusPayload) {
    return this.apiService.post('/reports/' + rptId + '/inquire', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  approve(rptId) {
    return this.apiService.post('/reports/' + rptId + '/approve');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  addApprover(rptId, approverEmail, comment) {
    const data = {
      approver_email: approverEmail,
      comment,
    };
    return this.apiService.post('/reports/' + rptId + '/approvals', data);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  removeApprover(rptId, approvalId) {
    return this.apiService.post('/reports/' + rptId + '/approvals/' + approvalId + '/disable');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  updateReportDetails(erpt) {
    const reportData = this.dataTransformService.unflatten(erpt);
    return this.apiService
      .post('/reports', reportData.rp)
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
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

  getPaginatedERptcStats(params) {
    return this.apiService.get('/erpts/stats', { params });
  }

  getPaginatedERptcCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.apiService.get('/erpts/count', { params }).pipe(
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
    config: Partial<{ offset: number; limit: number; order: string; queryParams: any }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ) {
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

  getTeamReportsCount(queryParams = {}) {
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
  ) {
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

  getReport(id: string) {
    return this.getMyReports({
      offset: 0,
      limit: 1,
      queryParams: {
        rp_id: `eq.${id}`,
      },
    }).pipe(map((res) => res.data[0]));
  }

  getTeamReport(id: string) {
    return this.getTeamReports({
      offset: 0,
      limit: 1,
      queryParams: {
        rp_id: `eq.${id}`,
      },
    }).pipe(map((res) => res.data[0]));
  }

  actions(rptId: string) {
    return this.apiService.get('/reports/' + rptId + '/actions');
  }

  getExports(rptId: string) {
    return this.apiService.get('/reports/' + rptId + '/exports');
  }

  getApproversByReportId(rptId: string) {
    return this.apiService.get('/reports/' + rptId + '/approvers');
  }

  delete(rptId) {
    return this.apiService
      .delete('/reports/' + rptId)
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  downloadSummaryPdfUrl(data: { report_ids: string[]; email: string }) {
    return this.apiService.post('/reports/summary/download', data);
  }

  getAllExtendedReports(config: Partial<{ order: string; queryParams: any }>) {
    return this.getMyReportsCount(config.queryParams).pipe(
      switchMap((count) => {
        count = count > 50 ? count / 50 : 1;
        return range(0, count);
      }),
      concatMap((page) =>
        this.getMyReports({ offset: 50 * page, limit: 50, queryParams: config.queryParams, order: config.order })
      ),
      map((res) => res.data),
      reduce((acc, curr) => acc.concat(curr), [] as ExtendedReport[])
    );
  }

  getAllOpenReportsCount() {
    return this.getMyReportsCount({
      rp_state: 'in.(DRAFT,APPROVER_PENDING)',
    }).pipe(shareReplay(1));
  }

  getAllTeamExtendedReports(
    config: Partial<{ order: string; queryParams: any }> = {
      order: '',
      queryParams: {},
    }
  ) {
    return this.getTeamReportsCount().pipe(
      switchMap((count) => {
        count = count > 50 ? count / 50 : 1;
        return range(0, count);
      }),
      concatMap((page) =>
        this.getTeamReports({ offset: 50 * page, limit: 50, ...config.queryParams, order: config.order })
      ),
      map((res) => res.data),
      reduce((acc, curr) => acc.concat(curr), [] as ExtendedReport[])
    );
  }

  addOrderByParams(params, sortOrder?) {
    if (sortOrder) {
      return Object.assign(params, { order_by: sortOrder });
    } else {
      return params;
    }
  }

  searchParamsGenerator(search, sortOrder?) {
    let params = {};

    params = this.userReportsSearchParamsGenerator(params, search);
    params = this.addOrderByParams(params, sortOrder);

    return params;
  }

  userReportsSearchParamsGenerator(params, search) {
    const searchParams = this.getUserReportParams(search.state);

    let dateParams = null;
    // Filter expenses by date range
    // dateRange.from and dateRange.to needs to a valid date string (if present)
    // Example: dateRange.from = 'Jan 1, 2015', dateRange.to = 'Dec 31, 2017'

    if (search.dateRange && !isEqual(search.dateRange, {})) {
      // TODO: Fix before 2025
      let fromDate = new Date('Jan 1, 1970');
      let toDate = new Date('Dec 31, 2025');

      // Set fromDate to Jan 1, 1970 if none specified
      if (search.dateRange.from) {
        fromDate = new Date(search.dateRange.from);
      }

      // Set toDate to Dec 31, 2025 if none specified
      if (search.dateRange.to) {
        // Setting time to the end of the day
        toDate = new Date(new Date(search.dateRange.to).setHours(23, 59, 59, 999));
      }

      dateParams = {
        created_at: ['gte:' + new Date(fromDate).toISOString(), 'lte:' + new Date(toDate).toISOString()],
      };
    }

    return Object.assign({}, params, searchParams, dateParams);
  }

  getReportPurpose(reportPurpose) {
    return this.apiService.post('/reports/purpose', reportPurpose).pipe(map((res) => res.purpose));
  }

  getApproversInBulk(rptIds) {
    if (!rptIds || rptIds.length === 0) {
      return of([]);
    }
    const count = rptIds.length > 50 ? rptIds.length / 50 : 1;
    return range(0, count).pipe(
      map((page) => rptIds.slice(page * 50, (page + 1) * 50)),
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

  getFilteredPendingReports(searchParams) {
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

  getReportETxnc(rptId, orgUserId) {
    const data: any = {
      params: {},
    };

    if (orgUserId) {
      data.params.approver_id = orgUserId;
    }

    return this.apiService.get('/erpts/' + rptId + '/etxns', data);
  }

  getReportStats(params) {
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
