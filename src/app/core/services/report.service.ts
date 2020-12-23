import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { switchMap, tap, map, concatMap, reduce, shareReplay, finalize, mergeMap } from 'rxjs/operators';
import { from, range, forkJoin, of, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiV2Service } from './api-v2.service';
import { DateService } from './date.service';
import { ExtendedReport } from '../models/report.model';
import { OfflineService } from 'src/app/core/services/offline.service';
import { isEqual } from 'lodash';
import { DataTransformService } from './data-transform.service';
import { Cacheable, CacheBuster } from 'ts-cacheable';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private authService: AuthService,
    private apiv2Service: ApiV2Service,
    private dateService: DateService,
    private offlineService: OfflineService,
    private dataTransformService: DataTransformService
  ) { }

  getUserReportParams(state: string) {
    const stateMap = {
      draft: {
        state: ['DRAFT', 'DRAFT_INQUIRY']
      },
      pending: {
        state: ['APPROVER_PENDING']
      },
      inquiry: {
        state: ['APPROVER_INQUIRY']
      },
      approved: {
        state: ['APPROVED']
      },
      payment_queue: {
        state: ['PAYMENT_PENDING']
      },
      paid: {
        state: ['PAID']
      },
      edit: {
        state: ['DRAFT', 'APPROVER_PENDING']
      },
      all: {
        state: ['DRAFT', 'DRAFT_INQUIRY', 'COMPLETE', 'APPROVED', 'APPROVER_PENDING', 'APPROVER_INQUIRY', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID', 'REJECTED']
      }
    };

    return stateMap[state];
  }

  getPaginatedERptcStats(params) {
    return this.apiService.get('/erpts/stats', { params });
  }

  getPaginatedERptcCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/erpts/count', { params }).pipe(
              tap((res) => {
                this.storageService.set('erpts-count' + JSON.stringify(params), res);
              })
            );
          } else {
            return from(this.storageService.get('erpts-count' + JSON.stringify(params)));
          }
        }
      )
    );
  }

  getMyReportsCount(queryParams = {}) {
    return this.getMyReports({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(res => res.count)
    );
  }

  getMyReports(config: Partial<{ offset: number, limit: number, order: string, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiv2Service.get('/reports', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order: `${config.order || 'rp_created_at.desc'},rp_id.desc`,
            rp_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams
          }
        });
      }),
      map(res => res as {
        count: number,
        data: ExtendedReport[],
        limit: number,
        offset: number,
        url: string
      }),
      map(res => ({
        ...res,
        data: res.data.map(this.dateService.fixDates)
      }))
    );
  }

  getTeamReportsCount(queryParams = {}) {
    return this.getTeamReports({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(res => res.count)
    );
  }

  getTeamReports(config: Partial<{ offset: number, limit: number, order: string, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {

    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiv2Service.get('/reports', {
          params: {
            offset: config.offset,
            limit: config.limit,
            approved_by: 'cs.{' + eou.ou.id + '}',
            order: `${config.order || 'rp_created_at.desc'},rp_id.desc`,
            ...config.queryParams
          }
        });
      }),
      map(res => res as {
        count: number,
        data: ExtendedReport[],
        limit: number,
        offset: number,
        url: string
      }),
      map(res => ({
        ...res,
        data: res.data.map(this.dateService.fixDates)
      }))
    );
  }

  getReport(id: string) {
    return this.getMyReports({
      offset: 0,
      limit: 1,
      queryParams: {
        rp_id: `eq.${id}`
      }
    }).pipe(
      map(
        res => res.data[0]
      )
    );
  }

  getTeamReport(id: string) {
    return this.getTeamReports({
      offset: 0,
      limit: 1,
      queryParams: {
        rp_id: `eq.${id}`
      }
    }).pipe(
      map(
        res => res.data[0]
      )
    );
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
    return this.apiService.delete('/reports/' + rptId);
  }

  downloadSummaryPdfUrl(data: { report_ids: string[], email: string }) {
    return this.apiService.post('/reports/summary/download', data);
  }


  getAllExtendedReports(config: Partial<{ order: string, queryParams: any }>) {
    return this.getMyReportsCount(config.queryParams).pipe(
      switchMap(count => {
        return range(0, count / 50);
      }),
      concatMap(page => {
        return this.getMyReports({ offset: 50 * page, limit: 50, queryParams: config.queryParams, order: config.order });
      }),
      map(res => res.data),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as ExtendedReport[])
    );
  }

  getAllOpenReportsCount() {
    return this.getMyReportsCount({
      rp_state: 'in.(DRAFT,APPROVER_PENDING)'
    }).pipe(
      shareReplay()
    );
  }

  getAllTeamExtendedReports(config: Partial<{ order: string, queryParams: any }> = {
    order: '',
    queryParams: {}
  }) {
    return this.getTeamReportsCount().pipe(
      switchMap(count => {
        return range(0, count / 50);
      }),
      concatMap(page => {
        return this.getTeamReports({ offset: 50 * page, limit: 50, ...config.queryParams, order: config.order });
      }),
      map(res => res.data),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as ExtendedReport[])
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
        created_at: ['gte:' + (new Date(fromDate)).toISOString(), 'lte:' + (new Date(toDate)).toISOString()]
      };
    }

    return Object.assign({}, params, searchParams, dateParams);
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$
  })
  getPaginatedERptc(offset, limit, params) {
    const data = {
      params: {
        offset,
        limit
      }
    };

    Object.keys(params).forEach((param) => {
      data.params[param] = params[param];
    });

    return this.apiService.get('/erpts', data).pipe(
      map((erptcs) => {
        return erptcs.map(erptc => this.dataTransformService.unflatten(erptc));
      })
    );
  }

  getReportPurpose(reportPurpose) {
    return this.apiService.post('/reports/purpose', reportPurpose).pipe(
      map(res => {
        return res.purpose;
      })
    );
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$
  })
  getERpt(rptId) {
    return this.apiService.get('/erpts/' + rptId).pipe(
      map(data => {
        let erpt = this.dataTransformService.unflatten(data);
        this.dateService.fixDates(erpt.rp);
        if (erpt && erpt.rp && erpt.rp.created_at) {
          erpt.rp.created_at = this.dateService.getLocalDate(erpt.rp.created_at);
        }
        return erpt;
      })
    );
  }

  getApproversInBulk(rptIds) {
    if (!rptIds || rptIds.length === 0) {
      return of([]);
    }

    return range(0, rptIds.length / 50).pipe(
      map(page => {
        return {
          params: {
            report_ids: rptIds.slice(50 * page, 50)
          }
        };
      }),
      concatMap(params => {
        return this.apiService.get('/reports/approvers', params);
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [])
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

  getFilteredPendingReports(searchParams) {
    const params = this.searchParamsGenerator(searchParams);

    return this.getPaginatedERptcCount(params).pipe(
      switchMap((results) => {
        // getting all results -> offset = 0, limit = count
        return this.getPaginatedERptc(0, results.count, params);
      }),
      switchMap((erpts) => {
        const rptIds = erpts.map((erpt) => {
          return erpt.rp.id;
        });

        return this.getApproversInBulk(rptIds).pipe(
          map(approvals => {
            return this.addApprovers(erpts, approvals).filter(erpt => {
              return !erpt.rp.approvals || (erpt.rp.approvals && !erpt.rp.approvals.some((approval) => {
                return approval.state === 'APPROVAL_DONE';
              }));
            });
          })
        );
      }),
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  addTransactions(rptId, txnIds) {
    return this.apiService.post('/reports/' + rptId + '/txns', {
      ids: txnIds
    });
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  createDraft(report) {
    return this.apiService.post('/reports', report);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  create(report, txnIds) {
    return this.createDraft(report).pipe(
      switchMap(newReport => {
        return this.apiService.post('/reports/' + newReport.id + '/txns', { ids: txnIds }).pipe(
          switchMap(res => {
            return this.apiService.post('/reports/' + newReport.id + '/submit');
          })
        );
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  removeTransaction(rptId, txnId, comment?) {
    const aspy = {
      status: {
        comment
      }
    };
    return this.apiService.post('/reports/' + rptId + '/txns/' + txnId + '/remove', aspy);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  submit(rptId) {
    return this.apiService.post('/reports/' + rptId + '/submit');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  resubmit(rptId) {
    return this.apiService.post('/reports/' + rptId + '/resubmit');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  inquire(rptId, addStatusPayload) {
    return this.apiService.post('/reports/' + rptId + '/inquire', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  approve(rptId) {
    return this.apiService.post('/reports/' + rptId + '/approve');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  addApprover(rptId, approverEmail, comment) {
    var data = {
      approver_email: approverEmail,
      comment: comment
    };
    return this.apiService.post('/reports/' + rptId + '/approvals', data);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$
  })
  removeApprover(rptId, approvalId) {
    return this.apiService.post('/reports/' + rptId + '/approvals/' + approvalId + '/disable');
  }
}
