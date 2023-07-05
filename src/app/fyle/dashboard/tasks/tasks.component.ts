import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ModalController, RefresherEventDetail } from '@ionic/angular';
import { Observable, BehaviorSubject, forkJoin, from, of, concat, combineLatest } from 'rxjs';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { TaskCta } from 'src/app/core/models/task-cta.model';
import { TASKEVENT } from 'src/app/core/models/task-event.enum';
import { TaskFilters } from 'src/app/core/models/task-filters.model';
import { DashboardTask } from 'src/app/core/models/dashboard-task.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AuthService } from 'src/app/core/services/auth.service';
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

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
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

  constructor(
    private taskService: TasksService,
    private transactionService: TransactionService,
    private reportService: ReportService,
    private advanceRequestService: AdvanceRequestService,
    private modalController: ModalController,
    private trackingService: TrackingService,
    private loaderService: LoaderService,
    private matBottomSheet: MatBottomSheet,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private networkService: NetworkService
  ) {}

  ngOnInit() {
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

  init() {
    this.autoSubmissionReportDate$ = this.reportService
      .getReportAutoSubmissionDetails()
      .pipe(map((autoSubmissionReportDetails) => autoSubmissionReportDetails?.data?.next_at));

    this.tasks$ = combineLatest({
      taskFilters: this.loadData$,
      autoSubmissionReportDate: this.autoSubmissionReportDate$,
    }).pipe(
      switchMap(({ taskFilters, autoSubmissionReportDate }) =>
        this.taskService.getTasks(!!autoSubmissionReportDate, taskFilters)
      ),
      shareReplay(1)
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
      const paramFilters = this.activatedRoute.snapshot.queryParams.tasksFilters;

      /*
       * Show the auto-submission info card at the top of tasks page only if an auto-submission is scheduled
       * and incomplete expenses task is not shown (else it'll be shown with that task)
       * and hide it if the user is navigating to tasks section from teams section
       * Since we don't have tasks for team advances, have added a check only for team reports filter
       */
      this.showReportAutoSubmissionInfoCard =
        autoSubmissionReportDate && !isIncompleteExpensesTaskShown && paramFilters !== 'team_reports';
    });

    const paramFilters = this.activatedRoute.snapshot.queryParams.tasksFilters;
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

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  doRefresh(event?: { target?: RefresherEventDetail }) {
    forkJoin([this.transactionService.clearCache(), this.reportService.clearCache()]).subscribe(() => {
      this.loadData$.next(this.loadData$.getValue());
      if (event) {
        setTimeout(() => {
          event.target?.complete();
        }, 1500);
      }
    });
  }

  applyFilters(filters?) {
    const that = this;
    that.loadData$.next(filters || that.loadData$.getValue());
  }

  async openFilters(activeFilterInitialName?: string) {
    const filterPopover = await this.modalController.create({
      component: FyFiltersComponent,
      componentProps: {
        filterOptions: [
          {
            name: 'Expenses',
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: 'Complete',
                value: 'UNREPORTED',
              },
              {
                label: 'Draft',
                value: 'DRAFT',
              },
              {
                label: 'Duplicate',
                value: 'DUPLICATE',
              },
            ],
          } as FilterOptions<string>,
          {
            name: 'Reports',
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: 'Sent Back',
                value: 'SENT_BACK',
              },
              {
                label: 'Unsubmitted',
                value: 'DRAFT',
              },
              {
                label: 'Unapproved',
                value: 'TEAM',
              },
            ],
          } as FilterOptions<string>,
          {
            name: 'Advances',
            optionType: FilterOptionType.multiselect,
            options: [
              {
                label: 'Sent Back',
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

    const { data } = await filterPopover.onWillDismiss();
    if (data) {
      const filters = this.taskService.convertFilters(data);
      this.applyFilters(filters);
      this.filterPills = this.taskService.generateFilterPills(filters);
      this.trackingService.tasksFiltersApplied({
        ...filters,
      });
    }
  }

  onFilterClose(filterPillType: string) {
    if (filterPillType === 'Expenses') {
      this.applyFilters({
        ...this.loadData$.getValue(),
        draftExpenses: false,
        unreportedExpenses: false,
        potentialDuplicates: false,
      });
    }

    if (filterPillType === 'Reports') {
      this.applyFilters({
        ...this.loadData$.getValue(),
        draftReports: false,
        sentBackReports: false,
      });
    }

    if (filterPillType === 'Advances') {
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

  onFilterClick(filterPillType: string) {
    this.openFilters(filterPillType);
    this.trackingService.tasksFilterPillClicked({
      Asset: 'Mobile',
      filterPillType,
    });
  }

  onFilterPillsClearAll() {
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

  onTaskClicked(taskCta: TaskCta, task: DashboardTask): void {
    this.trackingService.tasksClicked({
      Asset: 'Mobile',
      header: task.header,
    });
    switch (taskCta.event) {
      case TASKEVENT.expensesAddToReport:
        this.onExpensesToReportTaskClick(taskCta, task);
        break;
      case TASKEVENT.openDraftReports:
        this.onOpenDraftReportsTaskClick(taskCta, task);
        break;
      case TASKEVENT.openSentBackReport:
        this.onSentBackReportTaskClick(taskCta, task);
        break;
      case TASKEVENT.reviewExpenses:
        this.onReviewExpensesTaskClick(taskCta, task);
        break;
      case TASKEVENT.openTeamReport:
        this.onTeamReportsTaskClick(taskCta, task);
        break;
      case TASKEVENT.openPotentialDuplicates:
        this.onPotentialDuplicatesTaskClick(taskCta, task);
        break;
      case TASKEVENT.openSentBackAdvance:
        this.onSentBackAdvanceTaskClick(taskCta, task);
        break;
      case TASKEVENT.mobileNumberVerification:
        this.onMobileNumberVerificationTaskClick(taskCta);
        break;
      default:
        break;
    }
  }

  onMobileNumberVerificationTaskClick(taskCta: TaskCta) {
    this.router.navigate([
      '/',
      'enterprise',
      'my_profile',
      {
        openPopover: taskCta.content === 'Add' ? 'add_mobile_number' : 'verify_mobile_number',
      },
    ]);
  }

  onReviewExpensesTaskClick(taskCta: TaskCta, task: DashboardTask) {
    const queryParams = {
      tx_state: 'in.(DRAFT)',
      tx_report_id: 'is.null',
    };
    from(this.loaderService.showLoader('please wait while we load your expenses', 3000))
      .pipe(
        switchMap(() =>
          this.transactionService.getAllExpenses({
            queryParams,
          })
        ),
        map((etxns) => etxns.map((etxn) => etxn.tx_id)),
        switchMap((selectedIds) => {
          const initial = selectedIds[0];
          const allIds = selectedIds;

          return this.transactionService.getETxnUnflattened(initial).pipe(
            map((etxn) => ({
              inital: etxn,
              allIds,
            }))
          );
        }),
        finalize(() => this.loaderService.hideLoader())
      )
      .subscribe(({ inital, allIds }) => {
        let category;

        if (inital.tx.org_category) {
          category = inital.tx.org_category.toLowerCase();
        }

        if (category === 'mileage') {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_mileage',
            {
              id: inital.tx.id,
              txnIds: JSON.stringify(allIds),
              activeIndex: 0,
            },
          ]);
        } else if (category === 'per diem') {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_per_diem',
            {
              id: inital.tx.id,
              txnIds: JSON.stringify(allIds),
              activeIndex: 0,
            },
          ]);
        } else {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_expense',
            {
              id: inital.tx.id,
              txnIds: JSON.stringify(allIds),
              activeIndex: 0,
            },
          ]);
        }
      });
  }

  onSentBackReportTaskClick(taskCta: TaskCta, task: DashboardTask) {
    if (task.count === 1) {
      const queryParams = {
        rp_state: 'in.(APPROVER_INQUIRY)',
      };

      from(this.loaderService.showLoader('Opening your report...'))
        .pipe(
          switchMap(() => this.reportService.getMyReports({ queryParams, offset: 0, limit: 1 })),
          finalize(() => this.loaderService.hideLoader())
        )
        .subscribe((res) => {
          this.router.navigate(['/', 'enterprise', 'my_view_report', { id: res.data[0].rp_id }]);
        });
    } else {
      this.router.navigate(['/', 'enterprise', 'my_reports'], {
        queryParams: {
          filters: JSON.stringify({ state: ['APPROVER_INQUIRY'] }),
        },
      });
    }
  }

  onSentBackAdvanceTaskClick(taskCta: TaskCta, task: DashboardTask) {
    if (task.count === 1) {
      const queryParams = {
        areq_state: 'in.(DRAFT)',
        areq_is_sent_back: 'is.true',
      };

      from(this.loaderService.showLoader('Opening your advance request...'))
        .pipe(
          switchMap(() => this.advanceRequestService.getMyadvanceRequests({ queryParams, offset: 0, limit: 1 })),
          finalize(() => this.loaderService.hideLoader())
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

  onTeamReportsTaskClick(taskCta: TaskCta, task: DashboardTask) {
    if (task.count === 1) {
      const queryParams = {
        rp_approval_state: ['in.(APPROVAL_PENDING)'],
        rp_state: ['in.(APPROVER_PENDING)'],
        sequential_approval_turn: ['in.(true)'],
      };
      from(this.loaderService.showLoader('Opening your report...'))
        .pipe(
          switchMap(() => this.reportService.getTeamReports({ queryParams, offset: 0, limit: 1 })),
          finalize(() => this.loaderService.hideLoader())
        )
        .subscribe((res) => {
          this.router.navigate(['/', 'enterprise', 'view_team_report', { id: res.data[0].rp_id, navigate_back: true }]);
        });
    } else {
      this.router.navigate(['/', 'enterprise', 'team_reports'], {
        queryParams: {
          filters: JSON.stringify({ state: ['APPROVER_PENDING'] }),
        },
      });
    }
  }

  onOpenDraftReportsTaskClick(taskCta: TaskCta, task: DashboardTask) {
    if (task.count === 1) {
      const queryParams = {
        rp_state: 'in.(DRAFT)',
      };

      from(this.loaderService.showLoader('Opening your report...'))
        .pipe(
          switchMap(() => this.reportService.getMyReports({ queryParams, offset: 0, limit: 1 })),
          finalize(() => this.loaderService.hideLoader())
        )
        .subscribe((res) => {
          this.router.navigate(['/', 'enterprise', 'my_view_report', { id: res.data[0].rp_id }]);
        });
    } else {
      this.router.navigate(['/', 'enterprise', 'my_reports'], {
        queryParams: {
          filters: JSON.stringify({ state: ['DRAFT'] }),
        },
      });
    }
  }

  onPotentialDuplicatesTaskClick(taskCta: TaskCta, task: DashboardTask) {
    this.trackingService.duplicateTaskClicked();
    this.router.navigate(['/', 'enterprise', 'potential-duplicates']);
  }

  addTransactionsToReport(report: ExtendedReport, selectedExpensesId: string[]): Observable<ExtendedReport> {
    return from(this.loaderService.showLoader('Adding transaction to report')).pipe(
      switchMap(() => this.reportService.addTransactions(report.rp_id, selectedExpensesId).pipe(map(() => report))),
      finalize(() => this.loaderService.hideLoader())
    );
  }

  showAddToReportSuccessToast(config: { message: string; report }) {
    const toastMessageData = {
      message: config.message,
      redirectionText: 'View Report',
    };
    const expensesAddedToReportSnackBar = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    this.trackingService.showToastMessage({ ToastContent: config.message });

    this.doRefresh();

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate([
        '/',
        'enterprise',
        'my_view_report',
        { id: config.report.rp_id || config.report.id, navigateBack: true },
      ]);
    });
  }

  showOldReportsMatBottomSheet() {
    const readyToReportEtxns$ = from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.transactionService.getAllETxnc({
          tx_org_user_id: 'eq.' + eou.ou.id,
          tx_state: 'in.(COMPLETE)',
          or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
          tx_report_id: 'is.null',
        })
      ),
      map((expenses) => expenses.map((expenses) => expenses.tx_id))
    );

    this.reportService
      .getAllExtendedReports({ queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' } })
      .pipe(
        map((openReports) =>
          openReports.filter(
            (openReport) =>
              // JSON.stringify(openReport.report_approvals).indexOf('APPROVAL_DONE') -> Filter report if any approver approved this report.
              // Converting this object to string and checking If `APPROVAL_DONE` is present in the string, removing the report from the list
              !openReport.report_approvals ||
              (openReport.report_approvals &&
                !(JSON.stringify(openReport.report_approvals).indexOf('APPROVAL_DONE') > -1))
          )
        ),
        switchMap((openReports) => {
          const addTxnToReportDialog = this.matBottomSheet.open(AddTxnToReportDialogComponent, {
            data: { openReports },
            panelClass: ['mat-bottom-sheet-1'],
          });
          return addTxnToReportDialog.afterDismissed();
        }),
        switchMap((data) => {
          if (data && data.report) {
            return readyToReportEtxns$.pipe(
              switchMap((selectedExpensesId) => this.addTransactionsToReport(data.report, selectedExpensesId))
            );
          } else {
            return of(null);
          }
        })
      )
      .subscribe((report: ExtendedReport) => {
        if (report) {
          let message = '';
          if (report.rp_state.toLowerCase() === 'draft') {
            message = 'Expenses added to an existing draft report';
          } else {
            message = 'Expenses added to report successfully';
          }
          this.showAddToReportSuccessToast({ message, report });
        }
      });
  }

  onExpensesToReportTaskClick(taskCta: TaskCta, task: DashboardTask) {
    this.showOldReportsMatBottomSheet();
  }

  autoSubmissionInfoCardClicked(isSeparateCard: boolean) {
    this.trackingService.autoSubmissionInfoCardClicked({
      isSeparateCard,
    });
  }
}
