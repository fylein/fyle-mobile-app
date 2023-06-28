import { Injectable } from '@angular/core';
import { ReportService } from '../../core/services/report.service';
import { map } from 'rxjs/operators';
import { StatsResponse } from '../../core/models/v2/stats-response.model';
import { TransactionService } from '../../core/services/transaction.service';
import { Observable } from 'rxjs';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { CardAggregateStats } from 'src/app/core/models/card-aggregate-stats.model';
import { UniqueCards } from 'src/app/core/models/unique-cards.model';
import { Stats } from '../../core/models/stats.model';
import { ReportStats } from 'src/app/core/models/report-stats.model';
import { UniqueCardStats } from 'src/app/core/models/unique-cards-stats.model';
import { CCCDetails } from 'src/app/core/models/ccc-expense-details.model';

@Injectable()
export class DashboardService {
  constructor(
    private reportService: ReportService,
    private transactionService: TransactionService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService
  ) {}

  getUnreportedExpensesStats(): Observable<Stats> {
    return this.transactionService
      .getTransactionStats('count(tx_id),sum(tx_amount)', {
        scalar: true,
        tx_state: 'in.(COMPLETE)',
        or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        tx_report_id: 'is.null',
      })
      .pipe(
        map((rawStatsResponse) => {
          const countAggregate = rawStatsResponse[0]?.aggregates?.find(
            (aggregate) => aggregate.function_name === 'count(tx_id)'
          );
          const amountAggregate = rawStatsResponse[0]?.aggregates?.find(
            (aggregate) => aggregate.function_name === 'sum(tx_amount)'
          );
          return {
            count: countAggregate && countAggregate.function_value,
            sum: amountAggregate && amountAggregate.function_value,
          };
        })
      );
  }

  getIncompleteExpensesStats(): Observable<Stats> {
    return this.transactionService
      .getTransactionStats('count(tx_id),sum(tx_amount)', {
        scalar: true,
        tx_state: 'in.(DRAFT)',
        tx_report_id: 'is.null',
      })
      .pipe(
        map((rawStatsResponse) => {
          const countAggregate = rawStatsResponse[0]?.aggregates?.find(
            (aggregate) => aggregate.function_name === 'count(tx_id)'
          );
          const amountAggregate = rawStatsResponse[0]?.aggregates?.find(
            (aggregate) => aggregate.function_name === 'sum(tx_amount)'
          );
          return {
            count: countAggregate && countAggregate.function_value,
            sum: amountAggregate && amountAggregate.function_value,
          };
        })
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

  getExpenseDetailsInCards(uniqueCards: UniqueCards[], statsResponse: CardAggregateStats[]): UniqueCardStats[] {
    return this.corporateCreditCardExpenseService.getExpenseDetailsInCards(uniqueCards, statsResponse);
  }

  getCCCDetails(): Observable<CCCDetails> {
    return this.corporateCreditCardExpenseService.getAssignedCards();
  }
}
