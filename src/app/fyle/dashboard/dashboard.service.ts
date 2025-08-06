import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CCCDetails } from 'src/app/core/models/ccc-expense-details.model';
import { ReportStats } from 'src/app/core/models/report-stats.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Stats } from '../../core/models/stats.model';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ReportStates } from './stat-badge/report-states.enum';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PlatformReportsStatsResponse } from 'src/app/core/models/platform/v1/report-stats-response.model';
import { GroupedReportStats } from 'src/app/core/models/platform/v1/grouped-report-stats.model';
import { TranslocoService } from '@jsverse/transloco';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';

@Injectable()
export class DashboardService {
  private corporateCreditCardExpenseService = inject(CorporateCreditCardExpenseService);

  private expensesService = inject(ExpensesService);

  private spenderReportsService = inject(SpenderReportsService);

  private approverReportsService = inject(ApproverReportsService);

  private authService = inject(AuthService);

  private translocoService = inject(TranslocoService);

  getUnreportedExpensesStats(): Observable<Stats> {
    return this.expensesService
      .getExpenseStats({
        state: 'in.(COMPLETE)',
        report_id: 'is.null',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
      })
      .pipe(
        map((stats) => ({
          count: stats.data.count,
          sum: stats.data.total_amount,
        })),
      );
  }

  getIncompleteExpensesStats(): Observable<Stats> {
    return this.expensesService
      .getExpenseStats({
        state: 'in.(DRAFT)',
        report_id: 'is.null',
      })
      .pipe(
        map((stats) => ({
          count: stats.data.count,
          sum: stats.data.total_amount,
        })),
      );
  }

  getUnapprovedTeamReportsStats(): Observable<PlatformReportsStatsResponse> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => {
        if (eou.ou?.roles?.includes('APPROVER')) {
          return this.approverReportsService.getReportsStats({
            next_approver_user_ids: `cs.[${eou.us.id}]`,
            state: `eq.${ReportStates.APPROVER_PENDING}`,
          });
        } else {
          return of(null);
        }
      }),
    );
  }

  isUserAnApprover(): Observable<boolean> {
    return from(this.authService.getEou()).pipe(
      map((eou: ExtendedOrgUser) => eou.ou?.roles?.includes('APPROVER') ?? false),
    );
  }

  getReportsStats(): Observable<ReportStats> {
    return this.spenderReportsService.getGroupedReportsStats().pipe(
      map((groupedStats) => {
        const statsMap = new Map(groupedStats.map((stat) => [stat.state, stat]));

        return {
          draft: this.transformStat(statsMap.get('DRAFT')),
          report: this.transformStat(statsMap.get('APPROVER_PENDING')),
          approved: this.transformStat(statsMap.get('APPROVED')),
          paymentPending: this.transformStat(statsMap.get('PAYMENT_PENDING')),
          processing: this.transformStat(statsMap.get('PAYMENT_PROCESSING')),
        };
      }),
    );
  }

  getCCCDetails(): Observable<CCCDetails[]> {
    return this.corporateCreditCardExpenseService.getAssignedCards();
  }

  getReportStateMapping(state: ReportStates): string {
    switch (state) {
      case ReportStates.DRAFT:
        return this.translocoService.translate('services.dashboard.draft');
      case ReportStates.APPROVER_PENDING:
        return this.translocoService.translate('services.dashboard.reported');
      case ReportStates.APPROVED:
        return this.translocoService.translate('services.dashboard.approved');
      case ReportStates.PAYMENT_PENDING:
        return this.translocoService.translate('services.dashboard.paymentPending');
      case ReportStates.PAYMENT_PROCESSING:
        return this.translocoService.translate('services.dashboard.processing');
    }
  }

  private transformStat(stat?: GroupedReportStats): PlatformReportsStatsResponse {
    return {
      count: stat?.count ?? 0,
      total_amount: stat?.total_amount ?? 0,
      reimbursable_amount: stat?.reimbursable_amount ?? 0,
      failed_amount: stat?.failed_amount ?? 0,
      failed_count: stat?.failed_count ?? 0,
      processing_amount: stat?.processing_amount ?? 0,
      processing_count: stat?.processing_count ?? 0,
    };
  }
}
