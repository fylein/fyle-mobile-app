import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, noop, Observable, of } from 'rxjs';
import { map, mergeAll, switchMap } from 'rxjs/operators';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ExtendedReport } from '../models/report.model';
import { TASKEVENT } from '../models/task-event.enum';
import { TaskFilters } from '../models/task-filters.model';
import { TaskIcon } from '../models/task-icon.enum';
import { DashboardTask } from '../models/task.model';
import { StatsResponse } from '../models/v2/stats-response.model';
import { AdvanceRequestService } from './advance-request.service';
import { AuthService } from './auth.service';
import { OfflineService } from './offline.service';
import { ReportService } from './report.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';
import { HandleDuplicatesService } from './handle-duplicates.service';
import { DuplicateSet } from '../models/v2/duplicate-sets.model';

type TaskDict = {
  sentBackReports: DashboardTask[];
  draftExpenses: DashboardTask[];
  unsubmittedReports: DashboardTask[];
  unreportedExpenses: DashboardTask[];
  teamReports: DashboardTask[];
  sentBackAdvances: DashboardTask[];
  potentialDuplicates: DashboardTask[];
};

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  totalTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  expensesTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  reportsTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  teamReportsTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  advancesTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private reportService: ReportService,
    private transactionService: TransactionService,
    private humanizeCurrency: HumanizeCurrencyPipe,
    private offlineService: OfflineService,
    private userEventService: UserEventService,
    private authService: AuthService,
    private handleDuplicatesService: HandleDuplicatesService,
    private advancesRequestService: AdvanceRequestService
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

  getTeamReportsTaskCount() {
    return this.teamReportsTaskCount$.asObservable();
  }

  getAdvancesTaskCount() {
    return this.advancesTaskCount$.asObservable();
  }

  generateSelectedFilters(filters: TaskFilters): SelectedFilters<any>[] {
    let selectedFilters = [];

    if (filters.draftExpenses) {
      selectedFilters.push({
        name: 'Expenses',
        value: ['DRAFT'],
      });
    }

    if (filters.unreportedExpenses) {
      const existingFilter = selectedFilters.find((filter) => filter.name === 'Expenses');
      if (existingFilter) {
        existingFilter.value.push('UNREPORTED');
      } else {
        selectedFilters.push({
          name: 'Expenses',
          value: ['UNREPORTED'],
        });
      }
    }

    if (filters.potentialDuplicates) {
      selectedFilters = this.generatePotentialDuplicatesFilter(selectedFilters);
    }

    if (filters.draftReports) {
      selectedFilters.push({
        name: 'Reports',
        value: ['DRAFT'],
      });
    }

    if (filters.sentBackReports) {
      selectedFilters = this.generateSentBackFilter(selectedFilters);
    }

    if (filters.teamReports) {
      const existingFilter = selectedFilters.find((filter) => filter.name === 'Reports');
      if (existingFilter) {
        existingFilter.value.push('TEAM');
      } else {
        selectedFilters.push({
          name: 'Reports',
          value: ['TEAM'],
        });
      }
    }

    if (filters.sentBackAdvances) {
      selectedFilters.push({
        name: 'Advances',
        value: ['SENT_BACK'],
      });
    }

    return selectedFilters;
  }

  generatePotentialDuplicatesFilter(selectedFilters: SelectedFilters<any>[]) {
    const existingFilter = selectedFilters.find((filter) => filter.name === 'Expenses');
    if (existingFilter) {
      existingFilter.value.push('DUPLICATE');
    } else {
      selectedFilters.push({
        name: 'Expenses',
        value: ['DUPLICATE'],
      });
    }
    return selectedFilters;
  }

  generateSentBackFilter(selectedFilters: SelectedFilters<any>[]) {
    const existingFilter = selectedFilters.find((filter) => filter.name === 'Reports');
    if (existingFilter) {
      existingFilter.value.push('SENT_BACK');
    } else {
      selectedFilters.push({
        name: 'Reports',
        value: ['SENT_BACK'],
      });
    }
    return selectedFilters;
  }

  convertFilters(selectedFilters: SelectedFilters<any>[]): TaskFilters {
    const generatedFilters: TaskFilters = {
      draftExpenses: false,
      draftReports: false,
      sentBackReports: false,
      unreportedExpenses: false,
      potentialDuplicates: false,
      teamReports: false,
      sentBackAdvances: false,
    };

    if (selectedFilters.some((filter) => filter.name === 'Expenses' && filter.value.includes('UNREPORTED'))) {
      generatedFilters.unreportedExpenses = true;
    }

    if (selectedFilters.some((filter) => filter.name === 'Expenses' && filter.value.includes('DRAFT'))) {
      generatedFilters.draftExpenses = true;
    }

    generatedFilters.potentialDuplicates = selectedFilters.some(
      (filter) => filter.name === 'Expenses' && filter.value.includes('DUPLICATE')
    );

    if (selectedFilters.some((filter) => filter.name === 'Reports' && filter.value.includes('SENT_BACK'))) {
      generatedFilters.sentBackReports = true;
    }

    if (selectedFilters.some((filter) => filter.name === 'Reports' && filter.value.includes('DRAFT'))) {
      generatedFilters.draftReports = true;
    }

    if (selectedFilters.some((filter) => filter.name === 'Reports' && filter.value.includes('TEAM'))) {
      generatedFilters.teamReports = true;
    }

    if (selectedFilters.some((filter) => filter.name === 'Advances' && filter.value.includes('SENT_BACK'))) {
      generatedFilters.sentBackAdvances = true;
    }

    return generatedFilters;
  }

  getExpensePill(filters: TaskFilters): FilterPill {
    const expensePills = [];
    const draftExpensesContent = filters.draftExpenses ? 'Draft' : '';
    if (draftExpensesContent) {
      expensePills.push(draftExpensesContent);
    }
    const unreportedExpensesContent = filters.unreportedExpenses ? 'Unreported' : '';
    if (unreportedExpensesContent) {
      expensePills.push(unreportedExpensesContent);
    }
    const potentialDuplicatesContent = filters.potentialDuplicates ? 'Duplicate' : '';
    if (potentialDuplicatesContent) {
      expensePills.push(potentialDuplicatesContent);
    }
    return {
      label: 'Expenses',
      type: 'Expenses',
      value: expensePills.join(', '),
    };
  }

  getReportsPill(filters: TaskFilters): FilterPill {
    const reportPills = [];
    const draftReportsContent = filters.draftReports && 'Draft';
    if (draftReportsContent) {
      reportPills.push(draftReportsContent);
    }
    const sentBackReportsContent = filters.sentBackReports && 'Sent Back';
    if (sentBackReportsContent) {
      reportPills.push(sentBackReportsContent);
    }
    const teamReportsContents = filters.teamReports && 'Unapproved';
    if (teamReportsContents) {
      reportPills.push(teamReportsContents);
    }

    return {
      label: 'Reports',
      type: 'Reports',
      value: reportPills.join(', '),
    };
  }

  getAdvancesPill(filters: TaskFilters): FilterPill {
    const advancePill = [];
    const sentBackAdvancesContent = filters.sentBackAdvances && 'Sent Back';
    if (sentBackAdvancesContent) {
      advancePill.push(sentBackAdvancesContent);
    }

    return {
      label: 'Advances',
      type: 'Advances',
      value: advancePill.join(', '),
    };
  }

  generateFilterPills(filters: TaskFilters): FilterPill[] {
    const filterPills: FilterPill[] = [];

    if (filters.draftExpenses || filters.unreportedExpenses || filters.potentialDuplicates) {
      filterPills.push(this.getExpensePill(filters));
    }

    if (filters.draftReports || filters.sentBackReports || filters.teamReports) {
      filterPills.push(this.getReportsPill(filters));
    }

    if (filters.sentBackAdvances) {
      filterPills.push(this.getAdvancesPill(filters));
    }

    return filterPills;
  }

  getTasks(filters?: TaskFilters): Observable<DashboardTask[]> {
    return forkJoin({
      potentialDuplicates: this.getPotentialDuplicatesTasks(),
      sentBackReports: this.getSentBackReportTasks(),
      unreportedExpenses: this.getUnreportedExpensesTasks(),
      unsubmittedReports: this.getUnsubmittedReportsTasks(),
      draftExpenses: this.getDraftExpensesTasks(),
      teamReports: this.getTeamReportsTasks(),
      sentBackAdvances: this.getSentBackAdvanceTasks(),
    }).pipe(
      map(
        ({
          potentialDuplicates,
          sentBackReports,
          unreportedExpenses,
          unsubmittedReports,
          draftExpenses,
          teamReports,
          sentBackAdvances,
        }) => {
          this.totalTaskCount$.next(
            sentBackReports.length +
              draftExpenses.length +
              unsubmittedReports.length +
              unreportedExpenses.length +
              teamReports.length +
              potentialDuplicates.length +
              sentBackAdvances.length
          );
          this.expensesTaskCount$.next(draftExpenses.length + unreportedExpenses.length + potentialDuplicates.length);
          this.reportsTaskCount$.next(sentBackReports.length + unsubmittedReports.length);
          this.teamReportsTaskCount$.next(teamReports.length);

          this.advancesTaskCount$.next(sentBackAdvances.length);
          if (
            !filters?.draftExpenses &&
            !filters?.draftReports &&
            !filters?.sentBackReports &&
            !filters?.unreportedExpenses &&
            !filters?.potentialDuplicates &&
            !filters?.teamReports &&
            !filters?.sentBackAdvances
          ) {
            return potentialDuplicates
              .concat(sentBackReports)
              .concat(draftExpenses)
              .concat(unsubmittedReports)
              .concat(unreportedExpenses)
              .concat(teamReports)
              .concat(sentBackAdvances);
          } else {
            return this.getFilteredTaskList(filters, {
              potentialDuplicates,
              sentBackReports,
              draftExpenses,
              unsubmittedReports,
              unreportedExpenses,
              teamReports,
              sentBackAdvances,
            });
          }
        }
      )
    );
  }

  private getFilteredTaskList(filters: TaskFilters, tasksDict: TaskDict) {
    const {
      draftExpenses,
      sentBackReports,
      teamReports,
      unreportedExpenses,
      potentialDuplicates,
      unsubmittedReports,
      sentBackAdvances,
    } = tasksDict;
    let tasks = [];

    if (filters?.potentialDuplicates) {
      tasks = tasks.concat(potentialDuplicates);
    }

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

    if (filters?.teamReports) {
      tasks = tasks.concat(teamReports);
    }

    if (filters?.sentBackAdvances) {
      tasks = tasks.concat(sentBackAdvances);
    }

    return tasks;
  }

  private getSentBackReports() {
    return this.reportService.getReportStatsData({
      scalar: true,
      aggregates: 'count(rp_id),sum(rp_amount)',
      rp_state: 'in.(APPROVER_INQUIRY)',
    });
  }

  private getSentBackReportTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      reportsStats: this.getSentBackReports(),
      homeCurrency: this.offlineService.getHomeCurrency(),
    }).pipe(
      map(({ reportsStats, homeCurrency }) =>
        this.mapSentBackReportsToTasks(this.mapScalarReportStatsResponse(reportsStats), homeCurrency)
      )
    );
  }

  private getUnsubmittedReportsStats() {
    return this.reportService.getReportStatsData({
      scalar: true,
      aggregates: 'count(rp_id),sum(rp_amount)',
      rp_state: 'in.(DRAFT)',
    });
  }

  private getSentBackAdvancesStats() {
    return this.advancesRequestService.getMyAdvanceRequestStats({
      aggregates: 'count(areq_id),sum(areq_amount)',
      areq_trip_request_id: 'is.null',
      areq_state: 'in.(DRAFT)',
      areq_is_sent_back: 'is.true',
      scalar: true,
    });
  }

  private getSentBackAdvanceTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      advancesStats: this.getSentBackAdvancesStats(),
      homeCurrency: this.offlineService.getHomeCurrency(),
    }).pipe(
      map(({ advancesStats, homeCurrency }) =>
        this.mapSentBackAdvancesToTasks(this.mapScalarAdvanceStatsResponse(advancesStats), homeCurrency)
      )
    );
  }

  private getTeamReportsStats() {
    return forkJoin({
      eou: from(this.authService.getEou()),
      sequentalApproversEnabled: this.offlineService
        .getOrgSettings()
        .pipe(map((orgSettings) => orgSettings.approval_settings.enable_sequential_approvers)),
    }).pipe(
      switchMap(({ eou, sequentalApproversEnabled }) =>
        this.reportService.getReportStatsData(
          {
            approved_by: 'cs.{' + eou.ou.id + '}',
            rp_approval_state: ['in.(APPROVAL_PENDING)'],
            rp_state: ['in.(APPROVER_PENDING)'],
            sequential_approval_turn: sequentalApproversEnabled ? ['in.(true)'] : ['in.(true)'],
            aggregates: 'count(rp_id),sum(rp_amount)',
            scalar: true,
          },
          false
        )
      )
    );
  }

  private getTeamReportsTasks() {
    return forkJoin({
      reportsStats: this.getTeamReportsStats(),
      homeCurrency: this.offlineService.getHomeCurrency(),
    }).pipe(
      map(({ reportsStats, homeCurrency }) =>
        this.mapAggregateToTeamReportTask(this.mapScalarReportStatsResponse(reportsStats), homeCurrency)
      )
    );
  }

  private getPotentialDuplicatesTasks() {
    return this.handleDuplicatesService
      .getDuplicateSets()
      .pipe(
        switchMap((duplicateSets) =>
          duplicateSets?.length > 0 ? this.mapPotentialDuplicatesTasks(duplicateSets) : of([])
        )
      );
  }

  private mapPotentialDuplicatesTasks(duplicateSets: DuplicateSet[]) {
    const duplicateIds = duplicateSets
      .map((value) => value.transaction_ids)
      .reduce((acc, curVal) => acc.concat(curVal), []);
    const task = [
      {
        hideAmount: true,
        count: duplicateSets.length,
        header: `${duplicateIds.length} Potential Duplicates`,
        subheader: `We detected ${duplicateIds.length} expenses which may be duplicates`,
        icon: TaskIcon.WARNING,
        ctas: [
          {
            content: 'Review',
            event: TASKEVENT.openPotentialDuplicates,
          },
        ],
      } as DashboardTask,
    ];
    return [task];
  }

  private getUnsubmittedReportsTasks() {
    return forkJoin({
      reportsStats: this.getUnsubmittedReportsStats(),
      homeCurrency: this.offlineService.getHomeCurrency(),
    }).pipe(
      map(({ reportsStats, homeCurrency }) =>
        this.mapAggregateToUnsubmittedReportTask(this.mapScalarReportStatsResponse(reportsStats), homeCurrency)
      )
    );
  }

  private getUnreportedExpensesStats() {
    return this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
      scalar: true,
      tx_state: 'in.(COMPLETE)',
      or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
      tx_report_id: 'is.null',
    });
  }

  private getUnreportedExpensesTasks() {
    const queryParams = { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' };

    const openReports$ = this.reportService.getAllExtendedReports({ queryParams }).pipe(
      map((openReports) =>
        openReports.filter(
          (openReport) =>
            // JSON.stringify(openReport.report_approvals).indexOf('APPROVAL_DONE') -> Filter report if any approver approved this report.
            // Converting this object to string and checking If `APPROVAL_DONE` is present in the string, removing the report from the list
            !openReport.report_approvals ||
            (openReport.report_approvals &&
              !(JSON.stringify(openReport.report_approvals).indexOf('APPROVAL_DONE') > -1))
        )
      )
    );
    return forkJoin({
      transactionStats: this.getUnreportedExpensesStats(),
      homeCurrency: this.offlineService.getHomeCurrency(),
      openReports: openReports$,
    }).pipe(
      map(({ transactionStats, homeCurrency, openReports }) =>
        this.mapAggregateToUnreportedExpensesTask(
          this.mapScalarStatsResponse(transactionStats),
          homeCurrency,
          openReports
        )
      )
    );
  }

  private getDraftExpensesStats() {
    return this.transactionService.getTransactionStats('count(tx_id),sum(tx_amount)', {
      scalar: true,
      tx_state: 'in.(DRAFT)',
      tx_report_id: 'is.null',
    });
  }

  private getDraftExpensesTasks() {
    return forkJoin({
      transactionStats: this.getDraftExpensesStats(),
      homeCurrency: this.offlineService.getHomeCurrency(),
    }).pipe(
      map(({ transactionStats, homeCurrency }) =>
        this.mapAggregateToDraftExpensesTask(this.mapScalarStatsResponse(transactionStats), homeCurrency)
      )
    );
  }

  private getAmountString(amount: number, currency: string): string {
    return amount > 0 ? ` worth ${this.humanizeCurrency.transform(amount, currency, 2)} ` : '';
  }

  private mapSentBackReportsToTasks(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2, true),
          count: aggregate.totalCount,
          header: `Report${aggregate.totalCount === 1 ? '' : 's'} sent back!`,
          subheader: `${aggregate.totalCount} report${aggregate.totalCount === 1 ? '' : 's'}${this.getAmountString(
            aggregate.totalAmount,
            homeCurrency
          )} ${aggregate.totalCount === 1 ? 'was' : 'were'} sent back by your approver`,
          icon: TaskIcon.REPORT,
          ctas: [
            {
              content: `View Report${aggregate.totalCount === 1 ? '' : 's'}`,
              event: TASKEVENT.openSentBackReport,
            },
          ],
        } as DashboardTask,
      ];
    } else {
      return [];
    }
  }

  private mapSentBackAdvancesToTasks(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      const headerMessage = `Advance${aggregate.totalCount === 1 ? '' : 's'} sent back!`;
      const subheaderMessage = `${aggregate.totalCount} advance${
        aggregate.totalCount === 1 ? '' : 's'
      }${this.getAmountString(aggregate.totalAmount, homeCurrency)} ${
        aggregate.totalCount === 1 ? 'was' : 'were'
      } sent back by your approver`;
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2, true),
          count: aggregate.totalCount,
          header: headerMessage,
          subheader: subheaderMessage,
          icon: TaskIcon.ADVANCE,
          ctas: [
            {
              content: `View Advance${aggregate.totalCount === 1 ? '' : 's'}`,
              event: TASKEVENT.openSentBackAdvance,
            },
          ],
        },
      ];
    } else {
      return [];
    }
  }

  private mapAggregateToUnsubmittedReportTask(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2, true),
          count: aggregate.totalCount,
          header: `Unsubmitted report${aggregate.totalCount === 1 ? '' : 's'}`,
          subheader: `${aggregate.totalCount} report${aggregate.totalCount === 1 ? '' : 's'}${this.getAmountString(
            aggregate.totalAmount,
            homeCurrency
          )} remain${aggregate.totalCount === 1 ? 's' : ''} in draft state`,
          icon: TaskIcon.REPORT,
          ctas: [
            {
              content: `Submit Report${aggregate.totalCount === 1 ? '' : 's'}`,
              event: TASKEVENT.openDraftReports,
            },
          ],
        } as DashboardTask,
      ];
    } else {
      return [];
    }
  }

  private mapAggregateToTeamReportTask(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2, true),
          count: aggregate.totalCount,
          header: `Report${aggregate.totalCount === 1 ? '' : 's'} to be approved`,
          subheader: `${aggregate.totalCount} report${aggregate.totalCount === 1 ? '' : 's'}${this.getAmountString(
            aggregate.totalAmount,
            homeCurrency
          )} require${aggregate.totalCount === 1 ? 's' : ''} your approval`,
          icon: TaskIcon.REPORT,
          ctas: [
            {
              content: `Show Report${aggregate.totalCount === 1 ? '' : 's'}`,
              event: TASKEVENT.openTeamReport,
            },
          ],
        } as DashboardTask,
      ];
    } else {
      return [];
    }
  }

  private mapAggregateToDraftExpensesTask(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2, true),
          count: aggregate.totalCount,
          header: `Incomplete expense${aggregate.totalCount === 1 ? '' : 's'}`,
          subheader: `${aggregate.totalCount} expense${aggregate.totalCount === 1 ? '' : 's'}${this.getAmountString(
            aggregate.totalAmount,
            homeCurrency
          )} require additional information`,
          icon: TaskIcon.WARNING,
          ctas: [
            {
              content: `Review Expense${aggregate.totalCount === 1 ? '' : 's'}`,
              event: TASKEVENT.reviewExpenses,
            },
          ],
        } as DashboardTask,
      ];
    } else {
      return [];
    }
  }

  private mapAggregateToUnreportedExpensesTask(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string,
    openReports: ExtendedReport[]
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      const task = {
        amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, 2, true),
        count: aggregate.totalCount,
        header: `Unreported`,
        subheader: `${aggregate.totalCount} expense${aggregate.totalCount === 1 ? '' : 's'} ${this.getAmountString(
          aggregate.totalAmount,
          homeCurrency
        )} can be added to a report`,
        icon: TaskIcon.REPORT,
        ctas: [
          {
            content: 'Create New Report',
            event: TASKEVENT.expensesCreateNewReport,
          },
        ],
      } as DashboardTask;

      if (openReports.length > 0) {
        task.ctas.push({
          content: 'Add to Existing Report',
          event: TASKEVENT.expensesAddToReport,
        });
      }

      return [task];
    } else {
      return [];
    }
  }

  private getStatsFromResponse(statsResponse: StatsResponse, countName: string, sumName: string) {
    const countAggregate = statsResponse[0]?.aggregates.find((aggregate) => aggregate.function_name === countName) || 0;
    const amountAggregate = statsResponse[0]?.aggregates.find((aggregate) => aggregate.function_name === sumName) || 0;
    return {
      totalCount: countAggregate && countAggregate.function_value,
      totalAmount: amountAggregate && amountAggregate.function_value,
    };
  }

  private mapScalarReportStatsResponse(statsResponse: StatsResponse): { totalCount: number; totalAmount: number } {
    return this.getStatsFromResponse(statsResponse, 'count(rp_id)', 'sum(rp_amount)');
  }

  private mapScalarAdvanceStatsResponse(statsResponse: StatsResponse): { totalCount: number; totalAmount: number } {
    return this.getStatsFromResponse(statsResponse, 'count(areq_id)', 'sum(areq_amount)');
  }

  private mapScalarStatsResponse(statsResponse: StatsResponse): { totalCount: number; totalAmount: number } {
    return this.getStatsFromResponse(statsResponse, 'count(tx_id)', 'sum(tx_amount)');
  }
}
