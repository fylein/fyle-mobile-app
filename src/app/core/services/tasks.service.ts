import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, noop, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { TASKEVENT } from '../models/task-event.enum';
import { TaskFilters } from '../models/task-filters.model';
import { TaskIcon } from '../models/task-icon.enum';
import { DashboardTask } from '../models/dashboard-task.model';
import { AdvanceRequestService } from './advance-request.service';
import { AuthService } from './auth.service';
import { ReportService } from './report.service';
import { UserEventService } from './user-event.service';
import { HandleDuplicatesService } from './handle-duplicates.service';
import { CurrencyService } from './currency.service';
import { TaskDictionary } from '../models/task-dictionary.model';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { Datum } from '../models/v2/stats-response.model';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { OrgSettingsService } from './org-settings.service';

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
    private humanizeCurrency: HumanizeCurrencyPipe,
    private userEventService: UserEventService,
    private authService: AuthService,
    private handleDuplicatesService: HandleDuplicatesService,
    private expensesService: ExpensesService,
    private orgSettingsService: OrgSettingsService,
    private advancesRequestService: AdvanceRequestService,
    private currencyService: CurrencyService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private expensesService: ExpensesService
  ) {
    this.refreshOnTaskClear();
  }

  refreshOnTaskClear(): void {
    this.userEventService.onTaskCacheClear(() => {
      this.reportService.getReportAutoSubmissionDetails().subscribe((autoSubmissionReportDetails) => {
        const isReportAutoSubmissionScheduled = !!autoSubmissionReportDetails?.data?.next_at;
        this.getTasks(isReportAutoSubmissionScheduled).subscribe(noop);
      });
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
  getTotalTaskCount(): Observable<number> {
    return this.totalTaskCount$.asObservable();
  }

  getExpensesTaskCount(): Observable<number> {
    return this.expensesTaskCount$.asObservable();
  }

  getReportsTaskCount(): Observable<number> {
    return this.reportsTaskCount$.asObservable();
  }

  getTeamReportsTaskCount(): Observable<number> {
    return this.teamReportsTaskCount$.asObservable();
  }

  getAdvancesTaskCount(): Observable<number> {
    return this.advancesTaskCount$.asObservable();
  }

  generateSelectedFilters(filters: TaskFilters): SelectedFilters<string[]>[] {
    let selectedFilters: SelectedFilters<string[]>[] = [];

    if (filters.draftExpenses) {
      selectedFilters.push({
        name: 'Expenses',
        value: ['DRAFT'],
      });
    }

    if (filters.unreportedExpenses) {
      const existingFilter: SelectedFilters<string[]> = selectedFilters.find((filter) => filter.name === 'Expenses');
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

  convertFilters(selectedFilters: SelectedFilters<string[]>[]): TaskFilters {
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

    if (filters.draftExpenses) {
      expensePills.push('Incomplete');
    }

    if (filters.unreportedExpenses) {
      expensePills.push('Complete');
    }

    if (filters.potentialDuplicates) {
      expensePills.push('Duplicate');
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

  generatePotentialDuplicatesFilter(selectedFilters: SelectedFilters<string[]>[]): SelectedFilters<string[]>[] {
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

  generateSentBackFilter(selectedFilters: SelectedFilters<string[]>[]): SelectedFilters<string[]>[] {
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

  getTasks(isReportAutoSubmissionScheduled = false, filters?: TaskFilters): Observable<DashboardTask[]> {
    return forkJoin({
      mobileNumberVerification: this.getMobileNumberVerificationTasks(),
      potentialDuplicates: this.getPotentialDuplicatesTasks(),
      sentBackReports: this.getSentBackReportTasks(),
      unreportedExpenses: this.getUnreportedExpensesTasks(isReportAutoSubmissionScheduled),
      unsubmittedReports: this.getUnsubmittedReportsTasks(isReportAutoSubmissionScheduled),
      draftExpenses: this.getDraftExpensesTasks(),
      teamReports: this.getTeamReportsTasks(),
      sentBackAdvances: this.getSentBackAdvanceTasks(),
    }).pipe(
      map(
        ({
          mobileNumberVerification,
          potentialDuplicates,
          sentBackReports,
          unreportedExpenses,
          unsubmittedReports,
          draftExpenses,
          teamReports,
          sentBackAdvances,
        }) => {
          this.totalTaskCount$.next(
            mobileNumberVerification.length +
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
            return mobileNumberVerification
              .concat(potentialDuplicates)
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

  getFilteredTaskList(filters: TaskFilters, tasksDict: TaskDictionary): DashboardTask[] {
    const {
      draftExpenses,
      sentBackReports,
      teamReports,
      unreportedExpenses,
      potentialDuplicates,
      unsubmittedReports,
      sentBackAdvances,
    } = tasksDict;
    let tasks: DashboardTask[] = [];

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

  getMobileNumberVerificationTasks(): Observable<DashboardTask[]> {
    const rtfEnrolledCards$ = this.corporateCreditCardExpenseService
      .getCorporateCards()
      .pipe(map((cards) => cards.filter((card) => card.is_visa_enrolled || card.is_mastercard_enrolled)));

    return forkJoin({
      rtfEnrolledCards: rtfEnrolledCards$,
      eou: from(this.authService.getEou()),
    }).pipe(
      switchMap(({ rtfEnrolledCards, eou }) => {
        //Show this task only if mobile number is not verified and user is enrolled for RTF
        if (!eou.ou.mobile_verified && eou.ou.mobile_verification_attempts_left !== 0 && rtfEnrolledCards.length) {
          return of(this.mapMobileNumberVerificationTask(eou.ou.mobile?.length ? 'Verify' : 'Add'));
        }
        return of<DashboardTask[]>([]);
      })
    );
  }

  getSentBackReports(): Observable<Datum[]> {
    return this.reportService.getReportStatsData({
      scalar: true,
      aggregates: 'count(rp_id),sum(rp_amount)',
      rp_state: 'in.(APPROVER_INQUIRY)',
    });
  }

  getSentBackReportTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      reportsStats: this.getSentBackReports(),
      homeCurrency: this.currencyService.getHomeCurrency(),
    }).pipe(
      map(({ reportsStats, homeCurrency }: { reportsStats: Datum[]; homeCurrency: string }) =>
        this.mapSentBackReportsToTasks(this.mapScalarReportStatsResponse(reportsStats), homeCurrency)
      )
    );
  }

  getUnsubmittedReportsStats(): Observable<Datum[]> {
    return this.reportService.getReportStatsData({
      scalar: true,
      aggregates: 'count(rp_id),sum(rp_amount)',
      rp_state: 'in.(DRAFT)',
    });
  }

  getSentBackAdvancesStats(): Observable<Datum[]> {
    return this.advancesRequestService.getMyAdvanceRequestStats({
      aggregates: 'count(areq_id),sum(areq_amount)',
      areq_state: 'in.(DRAFT)',
      areq_is_sent_back: 'is.true',
      scalar: true,
    });
  }

  getSentBackAdvanceTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      advancesStats: this.getSentBackAdvancesStats(),
      homeCurrency: this.currencyService.getHomeCurrency(),
    }).pipe(
      map(({ advancesStats, homeCurrency }: { advancesStats: Datum[]; homeCurrency: string }) =>
        this.mapSentBackAdvancesToTasks(this.mapScalarAdvanceStatsResponse(advancesStats), homeCurrency)
      )
    );
  }

  getTeamReportsStats(): Observable<Datum[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.reportService.getReportStatsData(
          {
            approved_by: 'cs.{' + eou.ou.id + '}',
            rp_approval_state: ['in.(APPROVAL_PENDING)'],
            rp_state: ['in.(APPROVER_PENDING)'],
            sequential_approval_turn: ['in.(true)'],
            aggregates: 'count(rp_id),sum(rp_amount)',
            scalar: true,
          },
          false
        )
      )
    );
  }

  getTeamReportsTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      reportsStats: this.getTeamReportsStats(),
      homeCurrency: this.currencyService.getHomeCurrency(),
    }).pipe(
      map(({ reportsStats, homeCurrency }: { reportsStats: Datum[]; homeCurrency: string }) =>
        this.mapAggregateToTeamReportTask(this.mapScalarReportStatsResponse(reportsStats), homeCurrency)
      )
    );
  }

  getPotentialDuplicatesTasks(): Observable<DashboardTask[]> {
    const isDuplicateDetectionV2Enabled$ = this.orgSettingsService
      .get()
      .pipe(
        map(
          (orgSettings) =>
            orgSettings.duplicate_detection_v2_settings.allowed && orgSettings.duplicate_detection_v2_settings.enabled
        )
      );

    return isDuplicateDetectionV2Enabled$.pipe(
      switchMap((isDuplicateDetectionV2Enabled) => {
        if (isDuplicateDetectionV2Enabled) {
          return this.expensesService
            .getDuplicateSets()
            .pipe(
              map((duplicateSets) => (duplicateSets?.length > 0 ? duplicateSets.map((value) => value.expense_ids) : []))
            );
        } else {
          return this.handleDuplicatesService
            .getDuplicateSets()
            .pipe(
              map((duplicateSets) =>
                duplicateSets?.length > 0 ? duplicateSets.map((value) => value.transaction_ids) : []
              )
            );
        }
      }),
      map((duplicateSets) => this.mapPotentialDuplicatesTasks(duplicateSets))
    );
  }

  mapMobileNumberVerificationTask(type: 'Add' | 'Verify'): DashboardTask[] {
    const subheaderPrefixString = type === 'Add' ? 'Add and verify' : 'Verify';
    const task = [
      {
        hideAmount: true,
        header: `${type} Mobile Number`,
        subheader: `${subheaderPrefixString} your mobile number to text the receipts directly`,
        icon: TaskIcon.MOBILE,
        ctas: [
          {
            content: type,
            event: TASKEVENT.mobileNumberVerification,
          },
        ],
      },
    ];
    return task;
  }

  mapPotentialDuplicatesTasks(duplicateSets: string[][]): DashboardTask[] {
    if (duplicateSets.length > 0) {
      const duplicateIds = duplicateSets.reduce((acc, curVal) => acc.concat(curVal), []);

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
      return task;
    } else {
      return [];
    }
  }

  getUnsubmittedReportsTasks(isReportAutoSubmissionScheduled = false): Observable<DashboardTask[] | []> {
    //Unsubmitted reports task should not be shown if report auto-submission is scheduled
    if (isReportAutoSubmissionScheduled) {
      return of([]);
    }

    return forkJoin({
      reportsStats: this.getUnsubmittedReportsStats(),
      homeCurrency: this.currencyService.getHomeCurrency(),
    }).pipe(
      map(({ reportsStats, homeCurrency }: { reportsStats: Datum[]; homeCurrency: string }) =>
        this.mapAggregateToUnsubmittedReportTask(this.mapScalarReportStatsResponse(reportsStats), homeCurrency)
      )
    );
  }

  getUnreportedExpensesStats(): Observable<{ totalCount: number; totalAmount: number }> {
    return this.expensesService
      .getExpenseStats({
        state: 'in.(COMPLETE)',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
        report_id: 'is.null',
      })
      .pipe(
        map((stats) => ({
          totalCount: stats.data.count,
          totalAmount: stats.data.total_amount,
        }))
      );
  }

  getUnreportedExpensesTasks(isReportAutoSubmissionScheduled = false): Observable<DashboardTask[] | []> {
    //Unreported expenses task should not be shown if report auto submission is scheduled
    if (isReportAutoSubmissionScheduled) {
      return of([]);
    }

    return forkJoin({
      transactionStats: this.getUnreportedExpensesStats(),
      homeCurrency: this.currencyService.getHomeCurrency(),
    }).pipe(
      map(
        ({
          transactionStats,
          homeCurrency,
        }: {
          transactionStats: { totalCount: number; totalAmount: number };
          homeCurrency: string;
        }) => this.mapAggregateToUnreportedExpensesTask(transactionStats, homeCurrency)
      )
    );
  }

  getDraftExpensesStats(): Observable<{ totalCount: number; totalAmount: number }> {
    return this.expensesService
      .getExpenseStats({
        state: 'in.(DRAFT)',
        report_id: 'is.null',
      })
      .pipe(
        map((stats) => ({
          totalCount: stats.data.count,
          totalAmount: stats.data.total_amount,
        }))
      );
  }

  getDraftExpensesTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      transactionStats: this.getDraftExpensesStats(),
      homeCurrency: this.currencyService.getHomeCurrency(),
    }).pipe(
      map(
        ({
          transactionStats,
          homeCurrency,
        }: {
          transactionStats: { totalCount: number; totalAmount: number };
          homeCurrency: string;
        }) => this.mapAggregateToDraftExpensesTask(transactionStats, homeCurrency)
      )
    );
  }

  getAmountString(amount: number, currency: string): string {
    return amount > 0 ? ` worth ${this.humanizeCurrency.transform(amount, currency)} ` : '';
  }

  mapSentBackReportsToTasks(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, true),
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

  mapSentBackAdvancesToTasks(
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
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, true),
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

  mapAggregateToUnsubmittedReportTask(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, true),
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

  mapAggregateToTeamReportTask(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, true),
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

  mapAggregateToDraftExpensesTask(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, true),
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

  mapAggregateToUnreportedExpensesTask(
    aggregate: { totalCount: number; totalAmount: number },
    homeCurrency: string
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      const task = {
        amount: this.humanizeCurrency.transform(aggregate.totalAmount, homeCurrency, true),
        count: aggregate.totalCount,
        header: 'Expenses are ready to report',
        subheader: `${aggregate.totalCount} expense${aggregate.totalCount === 1 ? '' : 's'} ${this.getAmountString(
          aggregate.totalAmount,
          homeCurrency
        )} can be added to a report`,
        icon: TaskIcon.REPORT,
        ctas: [
          {
            content: 'Add to Report',
            event: TASKEVENT.expensesAddToReport,
          },
        ],
      } as DashboardTask;
      return [task];
    } else {
      return [];
    }
  }

  getStatsFromResponse(
    statsResponse: Datum[],
    countName: string,
    sumName: string
  ): { totalCount: number; totalAmount: number } {
    const countAggregate = statsResponse[0]?.aggregates.find((aggregate) => aggregate.function_name === countName) || 0;
    const amountAggregate = statsResponse[0]?.aggregates.find((aggregate) => aggregate.function_name === sumName) || 0;
    return {
      totalCount: countAggregate && countAggregate.function_value,
      totalAmount: amountAggregate && amountAggregate.function_value,
    };
  }

  mapScalarReportStatsResponse(statsResponse: Datum[]): { totalCount: number; totalAmount: number } {
    return this.getStatsFromResponse(statsResponse, 'count(rp_id)', 'sum(rp_amount)');
  }

  mapScalarAdvanceStatsResponse(statsResponse: Datum[]): { totalCount: number; totalAmount: number } {
    return this.getStatsFromResponse(statsResponse, 'count(areq_id)', 'sum(areq_amount)');
  }
}
