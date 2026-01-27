import { DatePipe } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import { OrgSettings } from '../models/org-settings.model';
import { Report } from '../models/platform/v1/report.model';
import { ReportAutoSubmissionDetails } from '../models/report-auto-submission-details.model';
import { ReportPermission } from '../models/report-permission.model';
import { ReportApprovals } from '../models/platform/report-approvals.model';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { PermissionsService } from './permissions.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';
import { TranslocoService } from '@jsverse/transloco';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private transactionService = inject(TransactionService);

  private userEventService = inject(UserEventService);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private approverPlatformApiService = inject(ApproverPlatformApiService);

  private datePipe = inject(DatePipe);

  private permissionsService = inject(PermissionsService);

  private translocoService = inject(TranslocoService);

  constructor() {
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

  addSystemApproverName(approval: ReportApprovals): ReportApprovals {
    if (approval?.approver_type === 'SYSTEM' && approval?.approver_user) {
      return {
        ...approval,
        approver_user: {
          ...approval.approver_user,
          full_name: 'SYSTEM',
        },
      };
    }
    return approval;
  }

  normalizeApprovalsForDisplay(approvals: ReportApprovals[] | null | undefined): ReportApprovals[] {
    if (!approvals?.length) {
      return [];
    }

    return approvals.map((approval) => this.addSystemApproverName(approval));
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
        }),
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
          return this.translocoService.translate('services.report.automaticSubmissionOnDate', {
            date: this.datePipe.transform(nextReportAutoSubmissionDate),
          });
        }
        return null;
      }),
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
