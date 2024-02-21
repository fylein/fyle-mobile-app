import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CCCDetails } from 'src/app/core/models/ccc-expense-details.model';
import { ReportStats } from 'src/app/core/models/report-stats.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { Stats } from '../../core/models/stats.model';
import { StatsResponse } from '../../core/models/v2/stats-response.model';
import { ReportService } from '../../core/services/report.service';

@Injectable()
export class DashboardService {
  constructor(
    private reportService: ReportService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private expensesService: ExpensesService
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
    return this.reportService
      .getReportStats({
        scalar: false,
        dimension_1_1: 'rp_state',
        aggregates: 'sum(rp_amount),count(rp_id)',
      })
      .pipe(map((statsResponse) => this.getReportAggregates(statsResponse)));
  }

  getReportAggregates(reportsStatsResponse: StatsResponse): ReportStats {
    const reportDatum = reportsStatsResponse.getDatum(0);
    const reportAggregateValues = reportDatum.value;
    const stateWiseAggregatesMap = reportAggregateValues
      .map((reportAggregateValue) => {
        const key = reportAggregateValue.key[0].column_value;
        const countAggregate = reportAggregateValue.aggregates.find(
          (aggregate) => aggregate.function_name === 'count(rp_id)'
        );
        const sumAggregate = reportAggregateValue.aggregates.find(
          (aggregate) => aggregate.function_name === 'sum(rp_amount)'
        );
        return {
          key,
          count: countAggregate && countAggregate.function_value,
          sum: sumAggregate && sumAggregate.function_value,
        };
      })
      .reduce((acc, curr) => {
        acc[curr.key] = {
          count: curr.count,
          sum: curr.sum,
        };
        return acc;
      }, {} as { [key: string]: { count: number; sum: number } });

    const draftReportStats = stateWiseAggregatesMap.DRAFT || { sum: 0, count: 0 };
    const reportedReportStats = stateWiseAggregatesMap.APPROVER_PENDING || { sum: 0, count: 0 };
    const approvedReportStats = stateWiseAggregatesMap.APPROVED || { sum: 0, count: 0 };
    const paymentPendingReportStats = stateWiseAggregatesMap.PAYMENT_PENDING || { sum: 0, count: 0 };
    const processingReportStats = stateWiseAggregatesMap.PAYMENT_PROCESSING || { sum: 0, count: 0 };

    return {
      draft: draftReportStats,
      report: reportedReportStats,
      approved: approvedReportStats,
      paymentPending: paymentPendingReportStats,
      processing: processingReportStats,
    };
  }

  getCCCDetails(): Observable<CCCDetails> {
    return this.corporateCreditCardExpenseService.getAssignedCards();
  }
}
