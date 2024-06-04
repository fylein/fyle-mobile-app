import { DatePipe } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, from, of, range } from 'rxjs';
import { catchError, concatMap, map, reduce, switchMap, tap } from 'rxjs/operators';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import { OrgSettings } from '../models/org-settings.model';
import { PdfExport } from '../models/pdf-exports.model';
import { Report } from '../models/platform/v1/report.model';
import { ReportAutoSubmissionDetails } from '../models/report-auto-submission-details.model';
import { ReportParams } from '../models/report-params.model';
import { ReportPermission } from '../models/report-permission.model';
import { ReportPurpose } from '../models/report-purpose.model';
import { ReportStateMap } from '../models/report-state-map.model';
import { UnflattenedReport } from '../models/report-unflattened.model';
import { ReportV1 } from '../models/report-v1.model';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { ExtendedReport } from '../models/report.model';
import { Approver } from '../models/v1/approver.model';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { NetworkService } from './network.service';
import { PermissionsService } from './permissions.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { StorageService } from './storage.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';
import { SpenderReportsService } from './platform/v1/spender/reports.service';

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
    private approverPlatformApiService: ApproverPlatformApiService,
    private datePipe: DatePipe,
    private launchDarklyService: LaunchDarklyService,
    private permissionsService: PermissionsService,
    private spenderReportsService: SpenderReportsService
  ) {
    reportsCacheBuster$.subscribe(() => {
      this.userEventService.clearTaskCache();
    });
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  clearCache(): Observable<null> {
    return of(null);
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
  create(report: ReportPurpose, expenseIds: string[]): Observable<Report> {
    return this.spenderReportsService.createDraft({ data: report }).pipe(
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
      })
    );
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  submit(rptId: string): Observable<void> {
    return this.apiService
      .post<void>('/reports/' + rptId + '/submit')
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  resubmit(rptId: string): Observable<void> {
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
  ): Observable<void> {
    return this.apiService.post('/reports/' + rptId + '/inquire', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  approve(rptId: string): Observable<void> {
    return this.apiService.post('/reports/' + rptId + '/approve');
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  addApprover(rptId: string, approverEmail: string, comment: string): Observable<void> {
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
    const reportData = this.dataTransformService.unflatten<UnflattenedReport, ExtendedReport>(erpt);
    return this.apiService
      .post<ReportV1>('/reports', reportData.rp)
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  updateReportPurpose(report: Report): Observable<Report> {
    const params = {
      data: {
        id: report.id,
        source: report.source,
        purpose: report.purpose,
      },
    };
    return this.spenderPlatformV1ApiService.post('/reports', params);
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
  getReportPermissions(orgSettings: OrgSettings): Observable<Partial<ReportPermission>> {
    return this.permissionsService
      .allowedActions('reports', ['approve', 'create', 'delete'], orgSettings)
      .pipe(catchError(() => [])) as Observable<Partial<ReportPermission>>;
  }

  getAutoSubmissionReportName(): Observable<string> {
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

  getExports(rptId: string): Observable<{ results: PdfExport[] }> {
    return this.apiService.get<{ results: PdfExport[] }>('/reports/' + rptId + '/exports');
  }

  getApproversByReportId(rptId: string): Observable<Approver[]> {
    return this.apiService.get('/reports/' + rptId + '/approvers');
  }

  delete(rptId: string): Observable<void> {
    return this.apiService
      .delete<void>('/reports/' + rptId)
      .pipe(switchMap((res) => this.clearTransactionCache().pipe(map(() => res))));
  }

  downloadSummaryPdfUrl(data: { report_ids: string[]; email: string }): Observable<{ report_url: string }> {
    return this.apiService.post('/reports/summary/download', data);
  }

  getReportPurpose(reportPurpose: { ids: string[] }): Observable<string> {
    return this.apiService.post<ReportV1>('/reports/purpose', reportPurpose).pipe(map((res) => res.purpose));
  }

  approverUpdateReportPurpose(report: Report): Observable<Report> {
    const params: { data: Pick<Report, 'id' | 'source' | 'purpose'> } = {
      data: {
        id: report.id,
        source: report.source,
        purpose: report.purpose,
      },
    };
    return this.approverPlatformApiService.post('/reports', params);
  }
}
