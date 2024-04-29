import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { CCCDetails } from 'src/app/core/models/ccc-expense-details.model';
import { ReportStats } from 'src/app/core/models/report-stats.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Stats } from '../../core/models/stats.model';
import { StatsResponse } from '../../core/models/v2/stats-response.model';
import { ReportService } from '../../core/services/report.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ReportsStatsResponsePlatform } from 'src/app/core/models/platform/v1/report-stats-response.model';

@Injectable()
export class DashboardService {
  constructor(
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private expensesService: ExpensesService,
    private spenderReportsService: SpenderReportsService
  ) {}

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
        }))
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
        }))
      );
  }

  getSpenderReportsStats(): Observable<ReportsStatsResponsePlatform> {
    return this.spenderReportsService.getReportsStats({
      state: 'eq.DRAFT',
    });
  }

  getReportsStats(): Observable<ReportStats> {
    const draftStats = this.spenderReportsService.getReportsStats({
      state: 'eq.DRAFT',
    });
    const reportedStats = this.spenderReportsService.getReportsStats({
      state: 'eq.APPROVER_PENDING',
    });
    const approvedStats = this.spenderReportsService.getReportsStats({
      state: 'eq.APPROVED',
    });
    const paymentPendingStats = this.spenderReportsService.getReportsStats({
      state: 'eq.PAYMENT_PENDING',
    });
    const paymentProcessingStats = this.spenderReportsService.getReportsStats({
      state: 'eq.PAYMENT_PROCESSING',
    });
    const reportStatsObservable$ = forkJoin({
      draft: draftStats,
      report: reportedStats,
      approved: approvedStats,
      paymentPending: paymentPendingStats,
      processing: paymentProcessingStats,
    });
    return reportStatsObservable$;
  }

  getCCCDetails(): Observable<CCCDetails> {
    return this.corporateCreditCardExpenseService.getAssignedCards();
  }
}
