import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { CCCDetails } from 'src/app/core/models/ccc-expense-details.model';
import { ReportStats } from 'src/app/core/models/report-stats.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Stats } from '../../core/models/stats.model';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';

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
    const reportStatsValues = {
      draft: draftStats,
      report: reportedStats,
      approved: approvedStats,
      paymentPending: paymentPendingStats,
      processing: paymentProcessingStats,
    };
    const reportStatsObservable$ = forkJoin(reportStatsValues);
    return reportStatsObservable$;
  }

  getCCCDetails(): Observable<CCCDetails> {
    return this.corporateCreditCardExpenseService.getAssignedCards();
  }
}
