import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, forkJoin, from, noop, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from 'src/app/shared/pipes/exact-currency.pipe';
import { TASKEVENT } from '../models/task-event.enum';
import { TaskFilters } from '../models/task-filters.model';
import { TaskIcon } from '../models/task-icon.enum';
import { DashboardTask } from '../models/dashboard-task.model';
import { AdvanceRequestService } from './advance-request.service';
import { AuthService } from './auth.service';
import { ReportService } from './report.service';
import { UserEventService } from './user-event.service';
import { CurrencyService } from './currency.service';
import { TaskDictionary } from '../models/task-dictionary.model';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { OrgSettingsService } from './org-settings.service';
import { EmployeesService } from './platform/v1/spender/employees.service';
import { StatsResponse } from '../models/platform/v1/stats-response.model';
import { SpenderReportsService } from './platform/v1/spender/reports.service';
import { PlatformReportsStatsResponse } from '../models/platform/v1/report-stats-response.model';
import { ApproverReportsService } from './platform/v1/approver/reports.service';
import { ReportState } from '../models/platform/v1/report.model';
import { OrgService } from './org.service';
import { UtilityService } from './utility.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private reportService = inject(ReportService);

  private humanizeCurrency = inject(HumanizeCurrencyPipe);

  private exactCurrency = inject(ExactCurrencyPipe);

  private userEventService = inject(UserEventService);

  private authService = inject(AuthService);

  private advancesRequestService = inject(AdvanceRequestService);

  private currencyService = inject(CurrencyService);

  private corporateCreditCardExpenseService = inject(CorporateCreditCardExpenseService);

  private expensesService = inject(ExpensesService);

  private orgSettingsService = inject(OrgSettingsService);

  private employeesService = inject(EmployeesService);

  private spenderReportsService = inject(SpenderReportsService);

  private approverReportsService = inject(ApproverReportsService);

  private orgService = inject(OrgService);

  private utilityService = inject(UtilityService);

  private translocoService = inject(TranslocoService);

  totalTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  expensesTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  reportsTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  teamReportsTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  advancesTaskCount$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor() {
    this.refreshOnTaskClear();
  }

  refreshOnTaskClear(): void {
    this.userEventService.onTaskCacheClear(() => {
      forkJoin([
        this.reportService.getReportAutoSubmissionDetails(),
        this.orgService.getCurrentOrg(),
        this.orgService.getPrimaryOrg(),
      ]).subscribe(([autoSubmissionReportDetails, currentOrg, primaryOrg]) => {
        const isReportAutoSubmissionScheduled = !!autoSubmissionReportDetails?.data?.next_at;
        const showTeamReportTask = currentOrg.id === primaryOrg.id;
        this.getTasks(isReportAutoSubmissionScheduled, undefined, showTeamReportTask).subscribe(noop);
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
        name: this.translocoService.translate('services.tasks.expenses'),
        value: ['DRAFT'],
      });
    }

    if (filters.unreportedExpenses) {
      const existingFilter: SelectedFilters<string[]> = selectedFilters.find(
        (filter) => filter.name === this.translocoService.translate('services.tasks.expenses'),
      );
      if (existingFilter) {
        existingFilter.value.push('UNREPORTED');
      } else {
        selectedFilters.push({
          name: this.translocoService.translate('services.tasks.expenses'),
          value: ['UNREPORTED'],
        });
      }
    }

    if (filters.potentialDuplicates) {
      selectedFilters = this.generatePotentialDuplicatesFilter(selectedFilters);
    }

    if (filters.draftReports) {
      selectedFilters.push({
        name: this.translocoService.translate('services.tasks.reports'),
        value: ['DRAFT'],
      });
    }

    if (filters.sentBackReports) {
      selectedFilters = this.generateSentBackFilter(selectedFilters);
    }

    if (filters.teamReports) {
      const existingFilter = selectedFilters.find(
        (filter) => filter.name === this.translocoService.translate('services.tasks.reports'),
      );
      if (existingFilter) {
        existingFilter.value.push('TEAM');
      } else {
        selectedFilters.push({
          name: this.translocoService.translate('services.tasks.reports'),
          value: ['TEAM'],
        });
      }
    }

    if (filters.sentBackAdvances) {
      selectedFilters.push({
        name: this.translocoService.translate('services.tasks.advances'),
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
      (filter) => filter.name === 'Expenses' && filter.value.includes('DUPLICATE'),
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
      expensePills.push(this.translocoService.translate('services.tasks.incomplete'));
    }

    if (filters.unreportedExpenses) {
      expensePills.push(this.translocoService.translate('services.tasks.complete'));
    }

    if (filters.potentialDuplicates) {
      expensePills.push(this.translocoService.translate('services.tasks.duplicate'));
    }
    return {
      label: this.translocoService.translate('services.tasks.expenses'),
      type: 'Expenses',
      value: expensePills.join(', '),
    };
  }

  getReportsPill(filters: TaskFilters): FilterPill {
    const reportPills = [];
    const draftReportsContent = filters.draftReports && this.translocoService.translate('services.tasks.draft');
    if (draftReportsContent) {
      reportPills.push(draftReportsContent);
    }
    const sentBackReportsContent =
      filters.sentBackReports && this.translocoService.translate('services.tasks.sentBack');
    if (sentBackReportsContent) {
      reportPills.push(sentBackReportsContent);
    }
    const teamReportsContents = filters.teamReports && this.translocoService.translate('services.tasks.unapproved');
    if (teamReportsContents) {
      reportPills.push(teamReportsContents);
    }

    return {
      label: this.translocoService.translate('services.tasks.reports'),
      type: 'Reports',
      value: reportPills.join(', '),
    };
  }

  getAdvancesPill(filters: TaskFilters): FilterPill {
    const advancePill = [];
    const sentBackAdvancesContent =
      filters.sentBackAdvances && this.translocoService.translate('services.tasks.sentBack');
    if (sentBackAdvancesContent) {
      advancePill.push(sentBackAdvancesContent);
    }

    return {
      label: this.translocoService.translate('services.tasks.advances'),
      type: 'Advances',
      value: advancePill.join(', '),
    };
  }

  generatePotentialDuplicatesFilter(selectedFilters: SelectedFilters<string[]>[]): SelectedFilters<string[]>[] {
    const existingFilter = selectedFilters.find(
      (filter) => filter.name === this.translocoService.translate('services.tasks.expenses'),
    );
    if (existingFilter) {
      existingFilter.value.push('DUPLICATE');
    } else {
      selectedFilters.push({
        name: this.translocoService.translate('services.tasks.expenses'),
        value: ['DUPLICATE'],
      });
    }
    return selectedFilters;
  }

  generateSentBackFilter(selectedFilters: SelectedFilters<string[]>[]): SelectedFilters<string[]>[] {
    const existingFilter = selectedFilters.find(
      (filter) => filter.name === this.translocoService.translate('services.tasks.reports'),
    );
    if (existingFilter) {
      existingFilter.value.push('SENT_BACK');
    } else {
      selectedFilters.push({
        name: this.translocoService.translate('services.tasks.reports'),
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

  getTasks(
    isReportAutoSubmissionScheduled = false,
    filters?: TaskFilters,
    showTeamReportTask?: boolean,
  ): Observable<DashboardTask[]> {
    return forkJoin({
      mobileNumberVerification: this.getMobileNumberVerificationTasks(),
      potentialDuplicates: this.getPotentialDuplicatesTasks(),
      sentBackReports: this.getSentBackReportTasks(),
      unreportedExpenses: this.getUnreportedExpensesTasks(isReportAutoSubmissionScheduled),
      unsubmittedReports: this.getUnsubmittedReportsTasks(isReportAutoSubmissionScheduled),
      draftExpenses: this.getDraftExpensesTasks(),
      sentBackAdvances: this.getSentBackAdvanceTasks(),
      setCommuteDetails: this.getCommuteDetailsTasks(),
      teamReports: this.getTeamReportsTasks(showTeamReportTask),
      addCorporateCard: this.getAddCorporateCardTask(),
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
          setCommuteDetails,
          addCorporateCard,
        }) => {
          this.totalTaskCount$.next(
            mobileNumberVerification.length +
              sentBackReports.length +
              draftExpenses.length +
              unsubmittedReports.length +
              unreportedExpenses.length +
              teamReports.length +
              potentialDuplicates.length +
              sentBackAdvances.length +
              setCommuteDetails.length +
              addCorporateCard.length,
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
              .concat(addCorporateCard)
              .concat(potentialDuplicates)
              .concat(sentBackReports)
              .concat(sentBackAdvances)
              .concat(teamReports)
              .concat(draftExpenses)
              .concat(unsubmittedReports)
              .concat(unreportedExpenses)
              .concat(setCommuteDetails);
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
        },
      ),
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
    return forkJoin({
      eou: from(this.authService.getEou()),
      isUserFromINCluster: from(this.utilityService.isUserFromINCluster()),
    }).pipe(
      switchMap(({ eou, isUserFromINCluster }) => {
        //Show this task only if mobile number is not verified and user is enrolled for RTF and user is not from IN cluster
        if (
          (eou.org.currency === 'USD' || eou.org.currency === 'CAD') &&
          !eou.ou.mobile_verified &&
          eou.ou.mobile_verification_attempts_left !== 0 &&
          !isUserFromINCluster
        ) {
          const isInvalidUSNumber = eou.ou.mobile && !eou.ou.mobile.startsWith('+1');
          return of(this.mapMobileNumberVerificationTask(isInvalidUSNumber));
        }
        return of<DashboardTask[]>([]);
      }),
    );
  }

  getSentBackReports(): Observable<PlatformReportsStatsResponse> {
    return this.spenderReportsService.getReportsStats({
      state: `eq.${ReportState.APPROVER_INQUIRY}`,
    });
  }

  getSentBackReportTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      reportsStats: this.getSentBackReports(),
      homeCurrency: this.currencyService.getHomeCurrency(),
    }).pipe(
      map(({ reportsStats, homeCurrency }: { reportsStats: PlatformReportsStatsResponse; homeCurrency: string }) =>
        this.mapSentBackReportsToTasks(reportsStats, homeCurrency),
      ),
    );
  }

  getUnsubmittedReportsStats(): Observable<PlatformReportsStatsResponse> {
    return this.spenderReportsService.getReportsStats({
      state: `eq.${ReportState.DRAFT}`,
    });
  }

  getSentBackAdvancesStats(): Observable<StatsResponse> {
    return this.advancesRequestService.getAdvanceRequestStats({
      state: `eq.SENT_BACK`,
    });
  }

  getSentBackAdvanceTasks(): Observable<DashboardTask[]> {
    return forkJoin({
      advancesStats: this.getSentBackAdvancesStats(),
      homeCurrency: this.currencyService.getHomeCurrency(),
    }).pipe(
      map(({ advancesStats, homeCurrency }: { advancesStats: StatsResponse; homeCurrency: string }) => {
        const aggregate = {
          totalAmount: advancesStats.total_amount,
          totalCount: advancesStats.count,
        };
        return this.mapSentBackAdvancesToTasks(aggregate, homeCurrency);
      }),
    );
  }

  getTeamReportsStats(): Observable<PlatformReportsStatsResponse> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => {
        if (eou.ou.roles.includes('APPROVER')) {
          return this.approverReportsService.getReportsStats({
            next_approver_user_ids: `cs.[${eou.us.id}]`,
            state: `eq.${ReportState.APPROVER_PENDING}`,
          });
        }
        const zeroResponse: PlatformReportsStatsResponse = {
          count: 0,
          failed_amount: null,
          failed_count: null,
          processing_amount: 0,
          processing_count: 0,
          reimbursable_amount: 0,
          total_amount: 0,
        };
        return of(zeroResponse);
      }),
    );
  }

  getTeamReportsTasks(showTeamReportTask?: boolean): Observable<DashboardTask[]> {
    if (showTeamReportTask) {
      return forkJoin({
        reportsStats: this.getTeamReportsStats(),
        homeCurrency: this.currencyService.getHomeCurrency(),
      }).pipe(
        map(({ reportsStats, homeCurrency }: { reportsStats: PlatformReportsStatsResponse; homeCurrency: string }) =>
          this.mapAggregateToTeamReportTask(reportsStats, homeCurrency),
        ),
      );
    } else {
      return of([] as DashboardTask[]);
    }
  }

  getAddCorporateCardTask(): Observable<DashboardTask[]> {
    return forkJoin([this.orgSettingsService.get(), this.corporateCreditCardExpenseService.getCorporateCards()]).pipe(
      map(([orgSettings, cards]) => {
        const isRtfEnabled =
          (orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled) ||
          (orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled);
        const isCCCEnabled =
          orgSettings.corporate_credit_card_settings.allowed && orgSettings.corporate_credit_card_settings.enabled;
        const rtfCards = cards.filter((card) => card.is_visa_enrolled || card.is_mastercard_enrolled);
        if (isRtfEnabled && isCCCEnabled && rtfCards.length === 0) {
          return this.mapAddCorporateCardTask();
        } else {
          return [] as DashboardTask[];
        }
      }),
    );
  }

  getPotentialDuplicatesTasks(): Observable<DashboardTask[]> {
    return this.expensesService.getDuplicateSets().pipe(
      map((duplicateSets) => {
        if (duplicateSets?.length > 0) {
          return duplicateSets.map((value) => value.expense_ids);
        } else {
          return [];
        }
      }),
      map((duplicateSets) => this.mapPotentialDuplicatesTasks(duplicateSets)),
    );
  }

  mapMobileNumberVerificationTask(isInvalidUSNumber: boolean): DashboardTask[] {
    const task = [
      {
        hideAmount: true,
        header: isInvalidUSNumber
          ? this.translocoService.translate('services.tasks.updatePhoneNumberHeader')
          : this.translocoService.translate('services.tasks.optInToTextReceiptsHeader'),
        subheader: isInvalidUSNumber
          ? this.translocoService.translate('services.tasks.updatePhoneNumberSubheader')
          : this.translocoService.translate('services.tasks.optInToTextReceiptsSubheader'),
        icon: TaskIcon.STARS,
        ctas: [
          {
            content: isInvalidUSNumber
              ? this.translocoService.translate('services.tasks.updateAndOptIn')
              : this.translocoService.translate('services.tasks.optIn'),
            event: TASKEVENT.mobileNumberVerification,
          },
        ],
      },
    ];
    return task;
  }

  mapAddCorporateCardTask(): DashboardTask[] {
    const task = [
      {
        hideAmount: true,
        header: this.translocoService.translate('services.tasks.addCorporateCard'),
        subheader: this.translocoService.translate('services.tasks.addCorporateCardSubheader'),
        icon: TaskIcon.CARD,
        ctas: [
          {
            content: this.translocoService.translate('services.tasks.add'),
            event: TASKEVENT.addCorporateCard,
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
          header: this.translocoService.translate('services.tasks.potentialDuplicatesHeader', {
            count: duplicateIds.length,
          }),
          subheader: this.translocoService.translate('services.tasks.potentialDuplicatesSubheader', {
            count: duplicateIds.length,
          }),
          icon: TaskIcon.WARNING,
          ctas: [
            {
              content: this.translocoService.translate('services.tasks.merge'),
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
      map(({ reportsStats, homeCurrency }: { reportsStats: PlatformReportsStatsResponse; homeCurrency: string }) =>
        this.mapAggregateToUnsubmittedReportTask(reportsStats, homeCurrency),
      ),
    );
  }

  getUnreportedExpensesStats(): Observable<{ totalCount: number; totalAmount: number }> {
    let queryParams = {
      state: 'in.(COMPLETE)',
      or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
      report_id: 'is.null',
      and: '()',
    };
    return this.orgSettingsService.get().pipe(
      map(
        (orgSetting) =>
          orgSetting.corporate_credit_card_settings?.enabled && orgSetting.pending_cct_expense_restriction?.enabled,
      ),
      switchMap((filterPendingTxn: boolean) => {
        if (filterPendingTxn) {
          queryParams = {
            ...queryParams,
            and: '(or(matched_corporate_card_transactions.eq.[],matched_corporate_card_transactions->0->status.neq.PENDING))',
          };
        }
        return this.expensesService.getExpenseStats(queryParams).pipe(
          map((stats) => ({
            totalCount: stats.data.count,
            totalAmount: stats.data.total_amount,
          })),
        );
      }),
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
        }) => this.mapAggregateToUnreportedExpensesTask(transactionStats, homeCurrency),
      ),
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
        })),
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
        }) => this.mapAggregateToDraftExpensesTask(transactionStats, homeCurrency),
      ),
    );
  }

  getAmountString(amount: number, currency: string): string {
    return amount > 0
      ? `${this.translocoService.translate('services.tasks.worth')} ${this.exactCurrency.transform({
          value: amount,
          currencyCode: currency,
        })}`
      : '';
  }

  mapSentBackReportsToTasks(aggregate: PlatformReportsStatsResponse, homeCurrency: string): DashboardTask[] {
    if (aggregate.count > 0) {
      return [
        {
          hideAmount: true,
          amount: this.exactCurrency.transform({
            value: aggregate.total_amount,
            currencyCode: homeCurrency,
            skipSymbol: true,
          }),
          count: aggregate.count,
          header: this.translocoService.translate(
            aggregate.count === 1 ? 'services.tasks.reportSentBack' : 'services.tasks.reportsSentBack',
          ),
          subheader: this.translocoService.translate(
            aggregate.count === 1
              ? 'services.tasks.sentBackReportSubheader'
              : 'services.tasks.sentBackReportsSubheader',
            { count: aggregate.count, amount: this.getAmountString(aggregate.total_amount, homeCurrency) },
          ),
          icon: TaskIcon.REPORT,
          ctas: [
            {
              content: this.translocoService.translate('services.tasks.review'),
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
    homeCurrency: string,
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      const headerMessage = this.translocoService.translate(
        aggregate.totalCount === 1 ? 'services.tasks.advanceSentBack' : 'services.tasks.advancesSentBack',
      );
      const subheaderMessage = this.translocoService.translate(
        aggregate.totalCount === 1
          ? 'services.tasks.sentBackAdvanceSubheader'
          : 'services.tasks.sentBackAdvancesSubheader',
        { count: aggregate.totalCount, amount: this.getAmountString(aggregate.totalAmount, homeCurrency) },
      );
      return [
        {
          hideAmount: true,
          amount: this.exactCurrency.transform({
            value: aggregate.totalAmount,
            currencyCode: homeCurrency,
            skipSymbol: true,
          }),
          count: aggregate.totalCount,
          header: headerMessage,
          subheader: subheaderMessage,
          icon: TaskIcon.ADVANCE,
          ctas: [
            {
              content: this.translocoService.translate('services.tasks.review'),
              event: TASKEVENT.openSentBackAdvance,
            },
          ],
        },
      ];
    } else {
      return [];
    }
  }

  mapAggregateToUnsubmittedReportTask(aggregate: PlatformReportsStatsResponse, homeCurrency: string): DashboardTask[] {
    if (aggregate.count > 0) {
      return [
        {
          hideAmount: true,
          amount: this.exactCurrency.transform({
            value: aggregate.total_amount,
            currencyCode: homeCurrency,
            skipSymbol: true,
          }),
          count: aggregate.count,
          header: this.translocoService.translate(
            aggregate.count === 1 ? 'services.tasks.unsubmittedReport' : 'services.tasks.unsubmittedReports',
            { count: aggregate.count },
          ),
          subheader: this.translocoService.translate(
            aggregate.count === 1
              ? 'services.tasks.unsubmittedReportSubheader'
              : 'services.tasks.unsubmittedReportsSubheader',
            { count: aggregate.count },
          ),
          icon: TaskIcon.REPORT,
          ctas: [
            {
              content: this.translocoService.translate('services.tasks.submitReport'),
              event: TASKEVENT.openDraftReports,
            },
          ],
        } as DashboardTask,
      ];
    } else {
      return [];
    }
  }

  mapAggregateToTeamReportTask(aggregate: PlatformReportsStatsResponse, homeCurrency: string): DashboardTask[] {
    if (aggregate.count > 0) {
      return [
        {
          hideAmount: true,
          amount: this.exactCurrency.transform({
            value: aggregate.total_amount,
            currencyCode: homeCurrency,
            skipSymbol: true,
          }),
          count: aggregate.count,
          header: this.translocoService.translate(
            aggregate.count === 1 ? 'services.tasks.reportToBeApproved' : 'services.tasks.reportsToBeApproved',
            { count: aggregate.count },
          ),
          subheader: this.translocoService.translate(
            aggregate.count === 1 ? 'services.tasks.teamReportSubheader' : 'services.tasks.teamReportsSubheader',
            { count: aggregate.count, amount: this.getAmountString(aggregate.total_amount, homeCurrency) },
          ),
          icon: TaskIcon.REPORT,
          ctas: [
            {
              content: this.translocoService.translate('services.tasks.approveReport'),
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
    homeCurrency: string,
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      return [
        {
          hideAmount: true,
          amount: this.exactCurrency.transform({
            value: aggregate.totalAmount,
            currencyCode: homeCurrency,
            skipSymbol: true,
          }),
          count: aggregate.totalCount,
          header: this.translocoService.translate(
            aggregate.totalCount === 1 ? 'services.tasks.incompleteExpense' : 'services.tasks.incompleteExpenses',
            { count: aggregate.totalCount },
          ),
          subheader: this.translocoService.translate(
            aggregate.totalCount === 1
              ? 'services.tasks.draftExpenseSubheader'
              : 'services.tasks.draftExpensesSubheader',
            { count: aggregate.totalCount, amount: this.getAmountString(aggregate.totalAmount, homeCurrency) },
          ),
          icon: TaskIcon.WARNING,
          ctas: [
            {
              content: this.translocoService.translate('services.tasks.completeExpense'),
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
    homeCurrency: string,
  ): DashboardTask[] {
    if (aggregate.totalCount > 0) {
      const task = {
        hideAmount: true,
        amount: this.exactCurrency.transform({
          value: aggregate.totalAmount,
          currencyCode: homeCurrency,
          skipSymbol: true,
        }),
        count: aggregate.totalCount,
        header: this.translocoService.translate(
          aggregate.totalCount === 1 ? 'services.tasks.expenseReadyToReport' : 'services.tasks.expensesReadyToReport',
          { count: aggregate.totalCount },
        ),
        subheader: this.translocoService.translate('services.tasks.unreportedExpenseSubheader', {
          count: aggregate.totalCount,
        }),
        icon: TaskIcon.REPORT,
        ctas: [
          {
            content: this.translocoService.translate('services.tasks.add'),
            event: TASKEVENT.expensesAddToReport,
          },
        ],
      } as DashboardTask;
      return [task];
    } else {
      return [];
    }
  }

  getCommuteDetailsTasks(): Observable<DashboardTask[]> {
    const isCommuteDeductionEnabled$ = this.orgSettingsService
      .get()
      .pipe(
        map(
          (orgSettings) =>
            orgSettings.mileage?.allowed &&
            orgSettings.mileage.enabled &&
            orgSettings.commute_deduction_settings?.allowed &&
            orgSettings.commute_deduction_settings.enabled,
        ),
      );

    const commuteDetails$ = from(this.authService.getEou()).pipe(
      switchMap((eou) => this.employeesService.getCommuteDetails(eou)),
    );

    return forkJoin({
      isCommuteDeductionEnabled: isCommuteDeductionEnabled$,
      commuteDetails: commuteDetails$,
    }).pipe(
      switchMap(({ isCommuteDeductionEnabled, commuteDetails }) => {
        if (isCommuteDeductionEnabled && !commuteDetails.data[0]?.commute_details?.home_location) {
          return of(this.getCommuteDetailsTask());
        }
        return of<DashboardTask[]>([]);
      }),
    );
  }

  getCommuteDetailsTask(): DashboardTask[] {
    const task = [
      {
        hideAmount: true,
        header: this.translocoService.translate('services.tasks.addCommuteDetails'),
        subheader: this.translocoService.translate('services.tasks.addCommuteDetailsSubheader'),
        icon: TaskIcon.LOCATION,
        ctas: [
          {
            content: this.translocoService.translate('services.tasks.add'),
            event: TASKEVENT.commuteDetails,
          },
        ],
      },
    ];
    return task;
  }
}
