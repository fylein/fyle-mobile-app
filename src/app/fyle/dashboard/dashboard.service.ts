import { Injectable } from '@angular/core';
import {ReportService} from '../../core/services/report.service';
import { map } from 'rxjs/operators';
import {StatsResponse} from '../../core/models/v2/stats-response.model';
import {TransactionService} from '../../core/services/transaction.service';

@Injectable()
export class DashboardService {
  constructor(
      private reportService: ReportService,
      private transactionService: TransactionService
  ) { }

  getUnreportedExpensesStats() {
    return this.transactionService.getPaginatedETxncStats({
      state: 'COMPLETE',
      policy_amount: ['gt:0.0001', 'is:null']
    }).pipe(
        map(statsResponse => ({
          totalCount: statsResponse.total_count,
          totalAmount: statsResponse.total_amount
        }))
    );
  }

  getReportsStats() {
    return this.reportService.getReportStats({
      scalar: false,
      dimension_1_1: 'rp_state',
      aggregates: 'sum(rp_amount),count(rp_id)'
    }).pipe(
        map(statsResponse => {
          return this.getReportAggregates(statsResponse);
        })
    );
  }

  getReportAggregates(reportsStatsResponse: StatsResponse) {
    const reportDatum =  reportsStatsResponse.getDatum(0);
    const reportAggregateValues = reportDatum.value;
    const stateWiseAggregatesMap = reportAggregateValues.map(reportAggregateValue => {
      const key = reportAggregateValue.key[0].column_value;
      const countAggregate = reportAggregateValue.aggregates.find(aggregate => aggregate.function_name === 'count(rp_id)');
      const sumAggregate = reportAggregateValue.aggregates.find(aggregate => aggregate.function_name === 'sum(rp_amount)');
      return {
        key,
        count: countAggregate && countAggregate.function_value,
        sum: sumAggregate && sumAggregate.function_value
      };
    }).reduce((acc, curr) => {
      acc[curr.key] = {
        count: curr.count,
        sum: curr.sum
      };
      return acc;
    }, {} as { [key: string]: { count: number, sum: number } });

    const draftReportStats = stateWiseAggregatesMap.DRAFT || { sum: 0, count: 0 };
    const reportedReportStats = stateWiseAggregatesMap.APPROVER_PENDING || { sum: 0, count: 0 };
    const approvedReportStats = stateWiseAggregatesMap.APPROVED || { sum: 0, count: 0 };
    const paymentPendingReportStats = stateWiseAggregatesMap.PAYMENT_PENDING || { sum: 0, count: 0 };

    return {
      draft: draftReportStats,
      report: reportedReportStats,
      approved: approvedReportStats,
      paymentPending: paymentPendingReportStats
    };
  }
}
