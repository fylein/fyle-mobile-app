import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, noop, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ExtendedReport } from '../models/report.model';
import { TASKEVENT } from '../models/task-event.enum';
import { TaskFilters } from '../models/task-filters.model';
import { TaskIcon } from '../models/task-icon.enum';
import { DashboardTask } from '../models/task.model';
import { StatsResponse } from '../models/v2/stats-response.model';
import { OfflineService } from './offline.service';
import { ReportService } from './report.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  totalTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  expensesTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  reportsTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private reportService: ReportService,
    private transactionService: TransactionService,
    private humanizeCurrency: HumanizeCurrencyPipe,
    private offlineService: OfflineService,
    private userEventService: UserEventService,
  ) {
    this.userEventService.onTaskCacheClear(() => {
      this.getTasks().subscribe(noop);
    });
  }

  /**
   * What is this asObservable?
   * So, when we are returning a Behavior Subject, Subject or a ReplaySubject -
   * it is considered best practice to return it as an Observable. Ref: https://eliteionic.com/tutorials/using-behaviorsubject-to-handle-asynchronous-loading-in-ionic/
   * Why?
   * Generally, we want to make sure we are only calling next on our BehaviorSubject from one place (this service) so
   * we don't want to give out the subject to other parts of the application which could then call its next method.
   */
  getTotalTaskCount() {
    return this.totalTaskCount$.asObservable();
  }

  getExpensesTaskCount() {
    return this.expensesTaskCount$.asObservable();
  }

  getReportsTaskCount() {
    return this.reportsTaskCount$.asObservable();
  }

  getTasks(filters?: TaskFilters): Observable<DashboardTask[]> {
    return forkJoin({
      sentBackReports: this.getSentBackReportTasks(),
      unreportedExpenses: this.getUnreportedExpensesTasks(),
      unsubmittedReports: this.getUnsubmittedReportsTasks(),
      draftExpenses: this.getDraftExpensesTasks()
    }).pipe(
      map(
        ({
          sentBackReports,
          unreportedExpenses,
          unsubmittedReports,
          draftExpenses
        }) => {
          this.totalTaskCount$.next(sentBackReports.length + draftExpenses.length + unsubmittedReports.length + unreportedExpenses.length);
          this.expensesTaskCount$.next(draftExpenses.length + unreportedExpenses.length);
          this.reportsTaskCount$.next(sentBackReports.length + unsubmittedReports.length);

          if (!filters?.draftExpenses && !filters?.draftReports && !filters?.sentBackReports && !filters?.unreportedExpenses) {
            return sentBackReports
              .concat(draftExpenses)
              .concat(unsubmittedReports)
              .concat(unreportedExpenses);
          } else {
            let tasks = [];

            if (filters?.sentBackReports) {
              tasks = tasks.concat(sentBackReports);
            }

            if (filters?.draftExpenses) {
              tasks = tasks.concat(draftExpenses);
            }

            if (filters?.draftReports) {
              tasks = tasks.concat(unsubmittedReports);
            }

            if (filters?.unreportedExpenses) {
              tasks = tasks.concat(unreportedExpenses);
            }

            return tasks;
          }
        }
      )
    );
  }

  getSentBackReports() {
    const queryParams = { rp_state: 'in.(APPROVER_INQUIRY)' };
    return this.reportService.getAllExtendedReports({ queryParams });
  }

  getSentBackReportTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      extendedReports: this.getSentBackReports(),
      homeCurrency: this.offlineService.getHomeCurrency()
    }).pipe(
      map(({ extendedReports, homeCurrency }) => this.mapSentBackReportsToTasks(extendedReports, homeCurrency))
    );
  }

  getUnsubmittedReportsStats() {
    return this.reportService.getReportStatsData({
      scalar: true,
      aggregates: 'count(rp_id),sum(rp_amount)',
      rp_state: 'in.(DRAFT)'
    });
  }

  getUnsubmittedReportsTasks() {
    return forkJoin({
      reportsStats: this.getUnsubmittedReportsStats(),
      homeCurrency: this.offlineService.getHomeCurrency()
    }).pipe(
      map(({ reportsStats, homeCurrency }) => this
        .mapAggregateToUnsubmittedReportTask(
          this.mapScalarReportStatsResponse(reportsStats),
          homeCurrency
        )
      )
    );
  }

  getUnreportedExpensesStats() {
    return this.transactionService
      .getTransactionStats('count(tx_id),sum(tx_amount)', {
        scalar: true,
        tx_state: 'in.(COMPLETE)',
        or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        tx_report_id: 'is.null',
      });
  }

  generateSelectedFilters(filters: TaskFilters): SelectedFilters<any>[] {
    const selectedFilters = [];

    if (filters.draftExpenses) {
      selectedFilters.push({
        name: 'Expenses',
        value: ['DRAFT'],
      });
    }

    if (filters.draftReports) {
      selectedFilters.push({
        name: 'Reports',
        value: ['DRAFT']
      });
    }

    if (filters.sentBackReports) {
      selectedFilters.push({
        name: 'Reports',
        value: ['SENT_BACK']
      });
    }

    if (filters.unreportedExpenses) {
      selectedFilters.push({
        name: 'Expenses',
        value: ['UNREPORTED']
      });
    }

    return selectedFilters;
  }


  convertFilters(selectedFilters: SelectedFilters<any>[]): TaskFilters {
    const generatedFilters: TaskFilters = {
      draftExpenses: false,
      draftReports: false,
      sentBackReports: false,
      unreportedExpenses: false
    };

    if (selectedFilters.some(filter => filter.name === 'Expenses' && filter.value.includes('UNREPORTED'))) {
      generatedFilters.unreportedExpenses = true;
    }

    if (selectedFilters.some(filter => filter.name === 'Expenses' && filter.value.includes('DRAFT'))) {
      generatedFilters.draftExpenses = true;
    }

    if (selectedFilters.some(filter => filter.name === 'Reports' && filter.value.includes('SENT_BACK'))) {
      generatedFilters.sentBackReports = true;
    }

    if (selectedFilters.some(filter => filter.name === 'Reports' && filter.value.includes('DRAFT'))) {
      generatedFilters.draftReports = true;
    }

    return generatedFilters;
  }

  getExpensePill(filters: TaskFilters): FilterPill {
    const draftExpensesContent = filters.draftExpenses ? 'Draft' : '';
    const unreportedExpensesContent = filters.unreportedExpenses ? 'Unreported' : '';
    const comma = (draftExpensesContent && unreportedExpensesContent) ? ', ' : '';
    return {
      label: 'Expenses',
      type: 'Expenses',
      value: `${draftExpensesContent}${comma}${unreportedExpensesContent}`,
    };
  }

  getReportsPill(filters: TaskFilters): FilterPill {
    const draftReportsContent = filters.draftReports ? 'Draft' : '';
    const sentBackReportsContent = filters.sentBackReports ? 'Sent Back' : '';
    const comma = (draftReportsContent && sentBackReportsContent) ? ', ' : '';
    return {
      label: 'Reports',
      type: 'Reports',
      value: `${draftReportsContent}${comma}${sentBackReportsContent}`
    };
  }

  generateFilterPills(filters: TaskFilters): FilterPill[] {
    const filterPills: FilterPill[] = [];

    if (filters.draftExpenses || filters.unreportedExpenses) {
      filterPills.push(this.getExpensePill(filters));
    }

    if (filters.draftReports || filters.sentBackReports) {
      filterPills.push(this.getReportsPill(filters));
    }

    return filterPills;
  }

  getUnreportedExpensesTasks() {
    return forkJoin({
      transactionStats: this.getUnreportedExpensesStats(),
      homeCurrency: this.offlineService.getHomeCurrency()
    }).pipe(
      map(
        ({ transactionStats, homeCurrency }) => this.mapAggregateToUnreportedExpensesTask(
          this.mapScalarStatsResponse(transactionStats),
          homeCurrency
        )
      )
    );
  }

  getDraftExpensesStats() {
    return this.transactionService
      .getTransactionStats('count(tx_id),sum(tx_amount)', {
        scalar: true,
        tx_state: 'in.(DRAFT)',
        tx_report_id: 'is.null',
      });
  }

  getDraftExpensesTasks() {
    return forkJoin({
      transactionStats: this.getDraftExpensesStats(),
      homeCurrency: this.offlineService.getHomeCurrency()
    }).pipe(map(
      ({ transactionStats, homeCurrency }) => this.mapAggregateToDraftExpensesTask(
        this.mapScalarStatsResponse(transactionStats),
        homeCurrency
      )
    ));
  }

  private getAmountString(amount: number, currency: string): string {
    return (amount > 0) ? ` worth ${this.humanizeCurrency.transform(amount, currency, 2)} ` : '';
  }

  private mapSentBackReportsToTasks(extendedReports: ExtendedReport[], homeCurrency: string): DashboardTask[] {
    return extendedReports.map((extendedReport => ({
      amount: this.humanizeCurrency.transform(extendedReport.rp_amount, homeCurrency, 2),
      count: extendedReport.rp_num_transactions,
      header: `Report sent back!`,
      subheader: 'Please check comments made by your approver',
      icon: TaskIcon.WARNING,
      ctas: [
        {
          content: 'View Report',
          event: TASKEVENT.openSentBackReport
        }
      ],
      data: extendedReport
    } as DashboardTask)));
  }

  private mapAggregateToUnsubmittedReportTask(aggregate: { totalCount: number; totalAmount: number }, homeCurrency: string): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [{
        amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2),
        count: aggregate.totalCount,
        header: `Unsubmitted reports`,
        subheader: `${aggregate.totalCount} reports ${this.getAmountString(aggregate.totalAmount, homeCurrency)} remain in draft state`,
        icon: TaskIcon.REPORT,
        ctas: [
          {
            content: 'Submit Reports',
            event: TASKEVENT.openDraftReports
          }
        ]
      } as DashboardTask];
    } else {
      return [];
    }
  }

  private mapAggregateToDraftExpensesTask(aggregate: { totalCount: number; totalAmount: number }, homeCurrency: string): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [{
        amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2),
        count: aggregate.totalCount,
        header: `Incomplete expenses`,
        subheader: `${aggregate.totalCount} expenses ${this.getAmountString(aggregate.totalAmount, homeCurrency)} require additional information`,
        icon: TaskIcon.WARNING,
        ctas: [
          {
            content: 'Review Expenses',
            event: TASKEVENT.reviewExpenses
          }
        ]
      } as DashboardTask];
    } else {
      return [];
    }
  }

  private mapAggregateToUnreportedExpensesTask(aggregate: { totalCount: number; totalAmount: number }, homeCurrency: string): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [{
        amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2),
        count: aggregate.totalCount,
        header: `Ready to Report`,
        subheader: `${aggregate.totalCount} expenses ${this.getAmountString(aggregate.totalAmount, homeCurrency)} can be added to a report`,
        icon: TaskIcon.REPORT,
        ctas: [
          {
            content: 'Create New Report',
            event: TASKEVENT.expensesCreateNewReport
          },
          {
            content: 'Add to Existing Report',
            event: TASKEVENT.expensesAddToReport
          }
        ]
      } as DashboardTask];
    } else {
      return [];
    }
  }

  private getStatsFromResponse(statsResponse: StatsResponse, countName: string, sumName: string) {
    const countAggregate = statsResponse[0]?.aggregates.find(
      (aggregate) => aggregate.function_name === countName
    ) || 0;
    const amountAggregate = statsResponse[0]?.aggregates.find(
      (aggregate) => aggregate.function_name === sumName
    ) || 0;
    return {
      totalCount: countAggregate && countAggregate.function_value,
      totalAmount: amountAggregate && amountAggregate.function_value,
    };
  }

  private mapScalarReportStatsResponse(statsResponse: StatsResponse): { totalCount: number; totalAmount: number } {
    return this.getStatsFromResponse(statsResponse, 'count(rp_id)', 'sum(rp_amount)');
  }

  private mapScalarStatsResponse(statsResponse: StatsResponse): { totalCount: number; totalAmount: number } {
    return this.getStatsFromResponse(statsResponse, 'count(tx_id)', 'sum(tx_amount)');
  }
}
