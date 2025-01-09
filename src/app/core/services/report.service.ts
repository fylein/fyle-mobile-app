import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import { OrgSettings } from '../models/org-settings.model';
import { Report } from '../models/platform/v1/report.model';
import { ReportAutoSubmissionDetails } from '../models/report-auto-submission-details.model';
import { ReportPermission } from '../models/report-permission.model';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { PermissionsService } from './permissions.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(
    private transactionService: TransactionService,
    private userEventService: UserEventService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private approverPlatformApiService: ApproverPlatformApiService,
    private datePipe: DatePipe,
    private permissionsService: PermissionsService
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
