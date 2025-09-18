import { Component, EventEmitter, OnInit, inject, output } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { IonCol, IonGrid, IonRefresher, IonRefresherContent, IonRow, IonSkeletonText, ModalController, PopoverController, RefresherEventDetail } from '@ionic/angular/standalone';
import { Observable, BehaviorSubject, forkJoin, from, of, concat, combineLatest } from 'rxjs';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { TaskCta } from 'src/app/core/models/task-cta.model';
import { TASKEVENT } from 'src/app/core/models/task-event.enum';
import { TaskFilters } from 'src/app/core/models/task-filters.model';
import { DashboardTask } from 'src/app/core/models/dashboard-task.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { FilterOptionType } from 'src/app/shared/components/fy-filters/filter-option-type.enum';
import { FilterOptions } from 'src/app/shared/components/fy-filters/filter-options.interface';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { AddTxnToReportDialogComponent } from '../../my-expenses/add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';
import { FySelectCommuteDetailsComponent } from 'src/app/shared/components/fy-select-commute-details/fy-select-commute-details.component';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CommuteDetailsResponse } from 'src/app/core/models/platform/commute-details-response.model';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { Report, ReportState } from 'src/app/core/models/platform/v1/report.model';
import { AuthService } from '../../../core/services/auth.service';
import { OrgService } from 'src/app/core/services/org.service';
import { FyOptInComponent } from 'src/app/shared/components/fy-opt-in/fy-opt-in.component';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { AddCorporateCardComponent } from '../../manage-corporate-cards/add-corporate-card/add-corporate-card.component';
import { CardAddedComponent } from '../../manage-corporate-cards/card-added/card-added.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { FyFilterPillsComponent } from '../../../shared/components/fy-filter-pills/fy-filter-pills.component';
import { NgClass, AsyncPipe } from '@angular/common';
import { AutoSubmissionInfoCardComponent } from './auto-submission-info-card/auto-submission-info-card.component';
import { TasksCardComponent } from './tasks-card/tasks-card.component';
import { FyZeroStateComponent } from '../../../shared/components/fy-zero-state/fy-zero-state.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  imports: [
    AsyncPipe,
    AutoSubmissionInfoCardComponent,
    FyFilterPillsComponent,
    FyZeroStateComponent,
    IonCol,
    IonGrid,
    IonRefresher,
    IonRefresherContent,
    IonRow,
    IonSkeletonText,
    NgClass,
    TasksCardComponent,
    TranslocoPipe
  ],
})
export class TasksComponent implements OnInit {
  private taskService = inject(TasksService);

  private transactionService = inject(TransactionService);

  private reportService = inject(ReportService);

  private spenderReportsService = inject(SpenderReportsService);

  private approverReportsService = inject(ApproverReportsService);

  private expensesService = inject(ExpensesService);

  private advanceRequestService = inject(AdvanceRequestService);

  private modalController = inject(ModalController);

  private trackingService = inject(TrackingService);

  private loaderService = inject(LoaderService);

  private matBottomSheet = inject(MatBottomSheet);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);

  private networkService = inject(NetworkService);

  private orgSettingsService = inject(OrgSettingsService);

  private authService = inject(AuthService);

  private orgService = inject(OrgService);

  private popoverController = inject(PopoverController);

  private corporateCreditCardExpenseService = inject(CorporateCreditCardExpenseService);

  private translocoService = inject(TranslocoService);

  readonly optedIn = output<void>();

  tasks$: Observable<DashboardTask[]>;

  loadData$: BehaviorSubject<TaskFilters> = new BehaviorSubject({
    sentBackReports: false,
    draftReports: false,
    draftExpenses: false,
    unreportedExpenses: false,
    teamReports: false,
    sentBackAdvances: false,
    potentialDuplicates: false,
  });

  isConnected$: Observable<boolean>;

  filterPills: FilterPill[] = [];

  taskCount = 0;

  showReportAutoSubmissionInfoCard = false;

  autoSubmissionReportDate$: Observable<Date>;

  isVisaRTFEnabled$: Observable<boolean>;

  isMastercardRTFEnabled$: Observable<boolean>;

  isYodleeEnabled$: Observable<boolean>;

  ngOnInit(): void {
    this.setupNetworkWatcher();
  }

  trackTasks(tasks: DashboardTask[]): void {
    tasks?.forEach((task) => {
      this.trackingService.tasksShown({
        Asset: 'Mobile',
        header: task.header,
      });
    });
  }

  init(): void {
    this.autoSubmissionReportDate$ = this.reportService
      .getReportAutoSubmissionDetails()
      .pipe(map((autoSubmissionReportDetails) => autoSubmissionReportDetails?.data?.next_at));

    this.tasks$ = combineLatest({
      taskFilters: this.loadData$,
      autoSubmissionReportDate: this.autoSubmissionReportDate$,
      currentOrg: this.orgService.getCurrentOrg(),
      primaryOrg: this.orgService.getPrimaryOrg(),
    }).pipe(
      switchMap(({ taskFilters, autoSubmissionReportDate, currentOrg, primaryOrg }) => {
        const showTeamReportTask = currentOrg.id === primaryOrg.id;
        return this.taskService.getTasks(!!autoSubmissionReportDate, taskFilters, showTeamReportTask);
      }),
      shareReplay(1),
    );

    this.tasks$.subscribe((tasks) => {
      this.trackTasks(tasks);
      this.taskCount = tasks.length;
    });

    combineLatest({
      tasks: this.tasks$,
      autoSubmissionReportDate: this.autoSubmissionReportDate$,
    }).subscribe(({ tasks, autoSubmissionReportDate }) => {
      const isIncompleteExpensesTaskShown = tasks.some((task) => task.header.includes('Incomplete expense'));
      const paramFilters = this.activatedRoute.snapshot.queryParams.tasksFilters as string;

      /*
       * Show the auto-submission info card at the top of tasks page only if an auto-submission is scheduled
       * and incomplete expenses task is not shown (else it'll be shown with that task)
       * and hide it if the user is navigating to tasks section from teams section
       * Since we don't have tasks for team advances, have added a check only for team reports filter
       */
      this.showReportAutoSubmissionInfoCard = autoSubmissionReportDate && paramFilters !== 'team_reports';
    });

    const paramFilters = this.activatedRoute.snapshot.queryParams.tasksFilters as string;
    if (paramFilters === 'expenses') {
      this.loadData$.next({
        draftExpenses: true,
        unreportedExpenses: true,
        draftReports: false,
        sentBackReports: false,
        teamReports: false,
        sentBackAdvances: false,
        potentialDuplicates: true,
      });
    }

    if (paramFilters === 'reports') {
      this.loadData$.next({
        draftExpenses: false,
        unreportedExpenses: false,
        draftReports: true,
        sentBackReports: true,
        teamReports: false,
        sentBackAdvances: false,
        potentialDuplicates: false,
      });
    }

    if (paramFilters === 'team_reports') {
      this.loadData$.next({
        draftExpenses: false,
        unreportedExpenses: false,
        draftReports: false,
        sentBackReports: false,
        teamReports: true,
        sentBackAdvances: false,
        potentialDuplicates: false,
      });
    }

    if (paramFilters === 'advances') {
      this.loadData$.next({
        draftExpenses: false,
        unreportedExpenses: false,
        draftReports: false,
        sentBackReports: false,
        teamReports: false,
        sentBackAdvances: true,
        potentialDuplicates: false,
      });
    }

    if (paramFilters === 'none') {
      this.loadData$.next({
        sentBackReports: false,
        draftReports: false,
        draftExpenses: false,
        unreportedExpenses: false,
        teamReports: false,
        sentBackAdvances: false,
        potentialDuplicates: false,
      });
    }

    this.filterPills = this.taskService.generateFilterPills(this.loadData$.getValue());
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1),
    );
  }

  doRefresh(event?: { target?: RefresherEventDetail }): void {
    forkJoin([this.transactionService.clearCache(), this.reportService.clearCache()]).subscribe(() => {
      this.loadData$.next(this.loadData$.getValue());
      if (event) {
        setTimeout(() => {
          event.target?.complete?.();
        }, 1500);
      }
    });
  }

  applyFilters(filters?: TaskFilters): void {
    const that = this;
    that.loadData$.next(filters || that.loadData$.getValue());
  }

  async openFilters(activeFilterInitialName?: string): Promise<void> {
    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: [
          {
            name: this.translocoService.translate('tasks.expenses'),
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: this.translocoService.translate('tasks.complete'),
                value: 'UNREPORTED',
              },
              {
                label: this.translocoService.translate('tasks.draft'),
                value: 'DRAFT',
              },
              {
                label: this.translocoService.translate('tasks.duplicate'),
                value: 'DUPLICATE',
              },
            ],
          } as FilterOptions<string>,
          {
            name: this.translocoService.translate('tasks.reports'),
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: this.translocoService.translate('tasks.sentBack'),
                value: 'SENT_BACK',
              },
              {
                label: this.translocoService.translate('tasks.unsubmitted'),
                value: 'DRAFT',
              },
              {
                label: this.translocoService.translate('tasks.unapproved'),
                value: 'TEAM',
              },
            ],
          } as FilterOptions<string>,
          {
            name: this.translocoService.translate('tasks.advances'),
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: this.translocoService.translate('tasks.sentBack'),
                value: 'SENT_BACK',
              },
            ],
          } as FilterOptions<string>,
        ],
        selectedFilterValues: this.taskService.generateSelectedFilters(this.loadData$.getValue()),
        activeFilterInitialName,
      },
      cssClass: 'dialog-popover',
    });

    await filterPopover.present();

    const { data } = await filterPopover.onWillDismiss<SelectedFilters<string[]>[]>();
    if (data) {
      const filters = this.taskService.convertFilters(data);
      this.applyFilters(filters);
      this.filterPills = this.taskService.generateFilterPills(filters);
      this.trackingService.tasksFiltersApplied({
        ...filters,
      });
    }
  }

  onFilterClose(filterPillType: string): void {
    if (filterPillType === this.translocoService.translate('tasks.expenses')) {
      this.applyFilters({
        ...this.loadData$.getValue(),
        draftExpenses: false,
        unreportedExpenses: false,
        potentialDuplicates: false,
      });
    }

    if (filterPillType === this.translocoService.translate('tasks.reports')) {
      this.applyFilters({
        ...this.loadData$.getValue(),
        draftReports: false,
        sentBackReports: false,
      });
    }

    if (filterPillType === this.translocoService.translate('tasks.advances')) {
      this.applyFilters({
        ...this.loadData$.getValue(),
        sentBackAdvances: false,
      });
    }

    this.filterPills = this.taskService.generateFilterPills(this.loadData$.getValue());
    this.trackingService.tasksFilterPillClicked({
      Asset: 'Mobile',
      filterPillType,
    });
  }

  onFilterClick(filterPillType: string): void {
    this.openFilters(filterPillType);
    this.trackingService.tasksFilterPillClicked({
      Asset: 'Mobile',
      filterPillType,
    });
  }

  onFilterPillsClearAll(): void {
    this.applyFilters({
      sentBackReports: false,
      draftReports: false,
      draftExpenses: false,
      unreportedExpenses: false,
      potentialDuplicates: false,
      teamReports: false,
      sentBackAdvances: false,
    });

    this.filterPills = this.taskService.generateFilterPills(this.loadData$.getValue());

    this.trackingService.tasksFilterClearAllClicked({
      Asset: 'Mobile',
      appliedFilters: this.loadData$.getValue(),
    });
  }

  handleEventsWithTaskConfig(taskCta: TaskCta, task: DashboardTask): void {
    switch (taskCta.event) {
      case TASKEVENT.openDraftReports:
        this.onOpenDraftReportsTaskClick(taskCta, task);
        break;
      case TASKEVENT.openSentBackReport:
        this.onSentBackReportTaskClick(taskCta, task);
        break;
      case TASKEVENT.openTeamReport:
        this.onTeamReportsTaskClick(taskCta, task);
        break;
      case TASKEVENT.openSentBackAdvance:
        this.onSentBackAdvanceTaskClick(taskCta, task);
        break;
      default:
        break;
    }
  }

  handleEventsWithoutTaskConfig(taskCtaEvent: TASKEVENT): void {
    switch (taskCtaEvent) {
      case TASKEVENT.expensesAddToReport:
        this.onExpensesToReportTaskClick();
        break;
      case TASKEVENT.reviewExpenses:
        this.onReviewExpensesTaskClick();
        break;
      case TASKEVENT.openPotentialDuplicates:
        this.onPotentialDuplicatesTaskClick();
        break;
      case TASKEVENT.mobileNumberVerification:
        this.onMobileNumberVerificationTaskClick();
        break;
      case TASKEVENT.addCorporateCard:
        this.onAddCorporateCardClick();
        break;
      case TASKEVENT.commuteDetails:
        this.onCommuteDetailsTaskClick();
        break;
      default:
        break;
    }
  }

  onTaskClicked(taskCta: TaskCta, task: DashboardTask): void {
    this.trackingService.tasksClicked({
      Asset: 'Mobile',
      header: task.header,
    });
    this.handleEventsWithTaskConfig(taskCta, task);
    this.handleEventsWithoutTaskConfig(taskCta.event);
  }

  onMobileNumberVerificationTaskClick(): void {
    this.trackingService.clickedOnTask({
      type: 'Opt in',
    });

    from(this.authService.getEou()).subscribe(async (eou) => {
      const optInModal = await this.modalController.create({
        component: FyOptInComponent,
        componentProps: {
          extendedOrgUser: eou,
        },
      });

      await optInModal.present();

      const { data } = await optInModal.onWillDismiss<{ action: string }>();

      if (data && data.action === 'SUCCESS') {
        this.trackingService.optedInFromTasks();
        this.doRefresh();
        // TODO: The 'emit' function requires a mandatory void argument
        this.optedIn.emit();
      }
    });
  }

  handleEnrollmentSuccess(): void {
    this.corporateCreditCardExpenseService.clearCache().subscribe(async () => {
      const cardAddedModal = await this.popoverController.create({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });

      await cardAddedModal.present();
      await cardAddedModal.onDidDismiss();

      this.doRefresh();
    });
  }

  onAddCorporateCardClick(): void {
    const orgSettings$ = this.orgSettingsService.get();
    this.isVisaRTFEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) => orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled,
      ),
    );

    this.isMastercardRTFEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled,
      ),
    );

    this.isYodleeEnabled$ = forkJoin([orgSettings$]).pipe(
      map(
        ([orgSettings]) =>
          orgSettings.bank_data_aggregation_settings.allowed && orgSettings.bank_data_aggregation_settings.enabled,
      ),
    );
    forkJoin([this.isVisaRTFEnabled$, this.isMastercardRTFEnabled$, this.isYodleeEnabled$]).subscribe(
      async ([isVisaRTFEnabled, isMastercardRTFEnabled, isYodleeEnabled]) => {
        const addCorporateCardPopover = await this.popoverController.create({
          component: AddCorporateCardComponent,
          cssClass: 'fy-dialog-popover',
          componentProps: {
            isVisaRTFEnabled,
            isMastercardRTFEnabled,
            isYodleeEnabled,
          },
        });

        await addCorporateCardPopover.present();
        const popoverResponse = (await addCorporateCardPopover.onDidDismiss()) as OverlayResponse<{ success: boolean }>;

        if (popoverResponse.data?.success) {
          this.handleEnrollmentSuccess();
        }
      },
    );
  }

  onReviewExpensesTaskClick(): void {
    const queryParams = {
      state: 'in.(DRAFT)',
      report_id: 'is.null',
    };
    from(this.loaderService.showLoader(this.translocoService.translate('tasks.loadingExpenses'), 3000))
      .pipe(
        switchMap(() =>
          this.expensesService.getAllExpenses({
            queryParams,
          }),
        ),
        map((expenses) => {
          const initialExpense = expenses[0];
          const allExpenseIds = expenses.map((expense) => expense.id);
          return {
            initial: this.transactionService.transformExpense(initialExpense),
            allExpenseIds,
          };
        }),
        finalize(() => this.loaderService.hideLoader()),
      )
      .subscribe(({ initial, allExpenseIds }) => {
        let category;

        if (initial.tx.org_category) {
          category = initial.tx.org_category.toLowerCase();
        }

        if (category === 'mileage') {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_mileage',
            {
              id: initial.tx.id,
              txnIds: JSON.stringify(allExpenseIds),
              activeIndex: 0,
              navigate_back: true,
            },
          ]);
        } else if (category === 'per diem') {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_per_diem',
            {
              id: initial.tx.id,
              txnIds: JSON.stringify(allExpenseIds),
              activeIndex: 0,
              navigate_back: true,
            },
          ]);
        } else {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_expense',
            {
              id: initial.tx.id,
              txnIds: JSON.stringify(allExpenseIds),
              activeIndex: 0,
              navigate_back: true,
            },
          ]);
        }
      });
  }

  onSentBackReportTaskClick(taskCta: TaskCta, task: DashboardTask): void {
    if (task.count === 1) {
      const queryParams = {
        state: `eq.${ReportState.APPROVER_INQUIRY}`,
        offset: 0,
        limit: 1,
      };

      from(this.loaderService.showLoader(this.translocoService.translate('tasks.openingReport')))
        .pipe(
          switchMap(() => this.spenderReportsService.getAllReportsByParams(queryParams)),
          finalize(() => this.loaderService.hideLoader()),
        )
        .subscribe((res) => {
          if (res[0]?.id) {
            this.router.navigate(['/', 'enterprise', 'my_view_report', { id: res[0].id }]);
          }
        });
    } else {
      this.router.navigate(['/', 'enterprise', 'my_reports'], {
        queryParams: {
          filters: JSON.stringify({ state: ['APPROVER_INQUIRY'] }),
        },
      });
    }
  }

  onSentBackAdvanceTaskClick(taskCta: TaskCta, task: DashboardTask): void {
    if (task.count === 1) {
      const queryParams = {
        state: 'eq.SENT_BACK',
      };

      from(this.loaderService.showLoader(this.translocoService.translate('tasks.openingAdvance')))
        .pipe(
          switchMap(() => this.advanceRequestService.getSpenderAdvanceRequests({ queryParams, offset: 0, limit: 1 })),
          finalize(() => this.loaderService.hideLoader()),
        )
        .subscribe((res) => {
          this.router.navigate(['/', 'enterprise', 'add_edit_advance_request', { id: res.data[0].areq_id }]);
        });
    } else {
      this.router.navigate(['/', 'enterprise', 'my_advances'], {
        queryParams: {
          filters: JSON.stringify({ state: ['SENT_BACK'] }),
        },
      });
    }
  }

  onTeamReportsTaskClick(taskCta: TaskCta, task: DashboardTask): void {
    if (task.count === 1) {
      from(this.authService.getEou()).subscribe((eou) => {
        const queryParams = {
          next_approver_user_ids: `cs.[${eou.us.id}]`,
          state: `eq.${ReportState.APPROVER_PENDING}`,
        };
        return from(this.loaderService.showLoader(this.translocoService.translate('tasks.openingReport')))
          .pipe(
            switchMap(() => this.approverReportsService.getAllReportsByParams(queryParams)),
            finalize(() => this.loaderService.hideLoader()),
          )
          .subscribe((res) => {
            if (res[0]?.id) {
              this.router.navigate(['/', 'enterprise', 'view_team_report', { id: res[0].id, navigate_back: true }]);
            }
          });
      });
    } else {
      this.router.navigate(['/', 'enterprise', 'team_reports'], {
        queryParams: {
          filters: JSON.stringify({ state: ['APPROVER_PENDING'] }),
        },
      });
    }
  }

  onOpenDraftReportsTaskClick(taskCta: TaskCta, task: DashboardTask): void {
    if (task.count === 1) {
      const queryParams = {
        state: `eq.${ReportState.DRAFT}`,
        offset: 0,
        limit: 1,
      };

      from(this.loaderService.showLoader(this.translocoService.translate('tasks.openingReport')))
        .pipe(
          switchMap(() => this.spenderReportsService.getAllReportsByParams(queryParams)),
          finalize(() => this.loaderService.hideLoader()),
        )
        .subscribe((res) => {
          if (res[0]?.id) {
            this.router.navigate(['/', 'enterprise', 'my_view_report', { id: res[0].id }]);
          }
        });
    } else {
      this.router.navigate(['/', 'enterprise', 'my_reports'], {
        queryParams: {
          filters: JSON.stringify({ state: ['DRAFT'] }),
        },
      });
    }
  }

  onPotentialDuplicatesTaskClick(): void {
    this.trackingService.duplicateTaskClicked();
    this.router.navigate(['/', 'enterprise', 'potential-duplicates']);
  }

  addTransactionsToReport(report: Report, selectedExpensesId: string[]): Observable<Report> {
    return from(this.loaderService.showLoader(this.translocoService.translate('tasks.addingExpenseToReport'))).pipe(
      switchMap(() => this.spenderReportsService.addExpenses(report.id, selectedExpensesId).pipe(map(() => report))),
      finalize(() => this.loaderService.hideLoader()),
    );
  }

  showAddToReportSuccessToast(config: { message: string; report: Report }): void {
    const toastMessageData = {
      message: config.message,
      redirectionText: this.translocoService.translate('tasks.viewReport'),
    };
    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    this.trackingService.showToastMessage({ ToastContent: config.message });

    this.doRefresh();

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: config.report.id, navigateBack: true }]);
    });
  }

  showOldReportsMatBottomSheet(): void {
    const params: ExpensesQueryParams = {
      queryParams: {
        state: 'in.(COMPLETE)',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
        report_id: 'is.null',
      },
    };

    const readyToReportExpenses$ = this.orgSettingsService.get().pipe(
      map(
        (orgSetting) =>
          orgSetting?.corporate_credit_card_settings?.enabled && orgSetting?.pending_cct_expense_restriction?.enabled,
      ),
      switchMap((filterPendingTxn: boolean) =>
        this.expensesService.getAllExpenses(params).pipe(
          map((expenses) =>
            expenses
              .filter((expense) => {
                if (filterPendingTxn && expense.matched_corporate_card_transaction_ids.length > 0) {
                  return expense.matched_corporate_card_transactions[0].status !== ExpenseTransactionStatus.PENDING;
                } else {
                  return true;
                }
              })
              .map((expenses) => expenses.id),
          ),
        ),
      ),
    );

    this.spenderReportsService
      .getAllReportsByParams({ state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' })
      .pipe(
        map((openReports) =>
          openReports.filter(
            (openReport) =>
              // (JSON.stringify(openReport.approvals.map((approval) => approval.state)) -> Filter report if any approver approved this report.
              !openReport.approvals ||
              (openReport.approvals &&
                !(
                  JSON.stringify(openReport.approvals.map((approval) => approval.state)).indexOf('APPROVAL_DONE') > -1
                )),
          ),
        ),
        switchMap((openReports) => {
          const addTxnToReportDialog = this.matBottomSheet.open(AddTxnToReportDialogComponent, {
            data: { openReports },
            panelClass: ['mat-bottom-sheet-1'],
          });
          return addTxnToReportDialog.afterDismissed();
        }),
        switchMap((data: { report: Report }) => {
          if (data && data.report) {
            return readyToReportExpenses$.pipe(
              switchMap((selectedExpensesId) => this.addTransactionsToReport(data.report, selectedExpensesId)),
            );
          } else {
            return of(null);
          }
        }),
      )
      .subscribe((report: Report) => {
        if (report) {
          let message = '';
          if (report.state.toLowerCase() === 'draft') {
            message = this.translocoService.translate('tasks.expensesAddedToDraft');
          } else {
            message = this.translocoService.translate('tasks.expensesAddedSuccessfully');
          }
          this.showAddToReportSuccessToast({ message, report });
        }
      });
  }

  onExpensesToReportTaskClick(): void {
    this.showOldReportsMatBottomSheet();
  }

  autoSubmissionInfoCardClicked(isSeparateCard: boolean): void {
    this.trackingService.autoSubmissionInfoCardClicked({
      isSeparateCard,
    });
  }

  showToastMessage(message: string, type: 'success' | 'failure'): void {
    const panelClass = type === 'success' ? 'msb-success' : 'msb-failure';
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(type, { message }),
      panelClass,
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  async onCommuteDetailsTaskClick(): Promise<void> {
    this.trackingService.commuteDeductionTaskClicked();

    const commuteDetailsModal = await this.modalController.create({
      component: FySelectCommuteDetailsComponent,
      mode: 'ios',
    });

    await commuteDetailsModal.present();

    const { data } = (await commuteDetailsModal.onWillDismiss()) as OverlayResponse<{
      action: string;
      commuteDetails: CommuteDetailsResponse;
    }>;

    // Show toast message and refresh the page once commute details are saved
    if (data.action === 'save') {
      this.trackingService.commuteDeductionDetailsAddedFromSpenderTask(data.commuteDetails);
      this.showToastMessage(this.translocoService.translate('tasks.commuteDetailsSaved'), 'success');
      this.doRefresh();
    }
  }
}
