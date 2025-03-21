import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { Observable, from, noop, concat, Subject, BehaviorSubject, Subscription, forkJoin } from 'rxjs';
import { ReportService } from 'src/app/core/services/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, shareReplay, takeUntil, tap, take, finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopoverController, ModalController, IonContent, SegmentCustomEvent } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { getCurrencySymbol } from '@angular/common';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import * as dayjs from 'dayjs';
import { StatusService } from 'src/app/core/services/status.service';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { cloneDeep } from 'lodash';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ReportPageSegment } from 'src/app/core/enums/report-page-segment.enum';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';
import { ShareReportComponent } from './share-report/share-report.component';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { Report, ReportState } from 'src/app/core/models/platform/v1/report.model';
import { ReportPermissions } from 'src/app/core/models/report-permissions.model';
import { ExtendedComment } from 'src/app/core/models/platform/v1/extended-comment.model';
import { Comment } from 'src/app/core/models/platform/v1/comment.model';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { ShowAllApproversPopoverComponent } from 'src/app/shared/components/fy-approver/show-all-approvers-popover/show-all-approvers-popover.component';
import { ReportApprovals } from 'src/app/core/models/platform/report-approvals.model';
import * as Sentry from '@sentry/angular-ivy';
import { ApprovalState } from 'src/app/core/models/platform/approval-state.enum';

@Component({
  selector: 'app-my-view-report',
  templateUrl: './my-view-report.page.html',
  styleUrls: ['./my-view-report.page.scss'],
})
export class MyViewReportPage {
  @ViewChild('commentInput') commentInput: ElementRef<HTMLInputElement>;

  @ViewChild(IonContent, { static: false }) content: IonContent;

  report$: Observable<Report>;

  expenses$: Observable<Expense[]>;

  canEdit$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  canResubmitReport$: Observable<boolean>;

  navigateBack = false;

  isConnected$: Observable<boolean>;

  eou$: Observable<ExtendedOrgUser>;

  onPageExit = new Subject();

  reportCurrencySymbol = '';

  estatuses: ExtendedComment[];

  systemComments: ExtendedComment[];

  type: string;

  systemEstatuses: ExtendedStatus[];

  userComments: ExtendedComment[];

  totalCommentsCount: number;

  newComment: string;

  objectType = 'reports';

  isCommentAdded: boolean;

  unreportedExpenses: Expense[];

  reportExpenseIds: string[];

  isExpensesLoading: boolean;

  reportId: string;

  loadReportDetails$ = new BehaviorSubject<void>(null);

  loadReportTxns$ = new BehaviorSubject<void>(null);

  segmentValue = ReportPageSegment.EXPENSES;

  simplifyReportsSettings$: Observable<{ enabled: boolean }>;

  eou: ExtendedOrgUser;

  reportNameChangeStartTime: number;

  reportNameChangeEndTime: number;

  timeSpentOnEditingReportName: number;

  hardwareBackButtonAction: Subscription;

  submitReportLoader = false;

  showViewApproverModal = false;

  approvals: ReportApprovals[];

  approverToShow: ReportApprovals;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private expensesService: ExpensesService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private networkService: NetworkService,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private statusService: StatusService,
    private orgSettingsService: OrgSettingsService,
    private platformHandlerService: PlatformHandlerService,
    private spenderReportsService: SpenderReportsService,
    private launchDarklyService: LaunchDarklyService
  ) {}

  get Segment(): typeof ReportPageSegment {
    return ReportPageSegment;
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  ionViewWillLeave(): void {
    this.hardwareBackButtonAction.unsubscribe();
    this.onPageExit.next(null);
  }

  getSimplifyReportSettings(orgSettings: OrgSettings): boolean {
    return orgSettings?.simplified_report_closure_settings?.enabled;
  }

  convertToEstatus(comments: ExtendedComment[]): ExtendedStatus[] {
    return comments.map((comment) => {
      const status: ExtendedStatus = {
        st_comment: comment.comment,
        isSelfComment: comment.isSelfComment,
        isBotComment: comment.isBotComment,
        isOthersComment: comment.isOthersComment,
        st_created_at: comment.created_at,
        st_id: comment.id,
        us_full_name: comment.creator_user?.full_name,
        st_diff: null,
        userTimezone: comment.userTimezone,
      };
      return status;
    });
  }

  setupComments(report: Report): void {
    this.eou$.subscribe((eou) => {
      this.estatuses =
        report?.comments?.map((comment: Comment) => {
          const extendedComment: ExtendedComment = {
            ...comment,
            isBotComment: ['SYSTEM', 'POLICY'].includes(comment.creator_user_id),
            isSelfComment: eou && eou.us && eou.us.id && comment.creator_user_id === eou.us.id,
            isOthersComment: eou && eou.us && eou.us.id && comment.creator_user_id !== eou.us.id,
          };
          return extendedComment;
        }) || [];

      this.totalCommentsCount = this.estatuses.filter((estatus) => estatus.creator_user_id !== 'SYSTEM').length;

      this.systemComments = this.estatuses.filter(
        (status) => ['SYSTEM', 'POLICY'].indexOf(status.creator_user_id) > -1 || !status.creator_user_id
      );

      this.type =
        this.objectType.toLowerCase() === 'transactions'
          ? 'Expense'
          : this.objectType.substring(0, this.objectType.length - 1);

      this.systemEstatuses = this.statusService.createStatusMap(this.convertToEstatus(this.systemComments), this.type);

      this.userComments = this.estatuses.filter(
        (status) => !!status.creator_user_id && !['SYSTEM', 'POLICY'].includes(status.creator_user_id)
      );

      this.userComments.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));

      for (let i = 0; i < this.userComments.length; i++) {
        const prevCommentDt = dayjs(this.userComments[i - 1] && this.userComments[i - 1].created_at);
        const currentCommentDt = dayjs(this.userComments[i] && this.userComments[i].created_at);
        if (dayjs(prevCommentDt).isSame(currentCommentDt, 'day')) {
          this.userComments[i].show_dt = false;
        } else {
          this.userComments[i].show_dt = true;
        }
      }
    });
  }

  setupApproverToShow(report: Report): void {
    const filteredApprover = this.approvals.filter(
      (approver) => report.next_approver_user_ids?.[0] === approver.approver_user.id
    );
    const highestRankApprover = this.approvals.reduce(
      (max, approver) => (approver.approver_order > max.approver_order ? approver : max),
      this.approvals[0]
    );
    this.approverToShow = filteredApprover.length === 1 ? filteredApprover[0] : highestRankApprover;
  }

  ionViewWillEnter(): void {
    this.setupNetworkWatcher();
    this.reportId = this.activatedRoute.snapshot.params.id as string;
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    this.segmentValue = ReportPageSegment.EXPENSES;

    this.report$ = this.loadReportDetails$.pipe(
      tap(() => this.loaderService.showLoader()),
      switchMap(() =>
        this.spenderReportsService.getReportById(this.reportId).pipe(finalize(() => this.loaderService.hideLoader()))
      ),
      map((report) => {
        this.setupComments(report);
        this.approvals = report?.approvals;
        // filtering out disabled approvals from my view report page
        this.approvals = report?.approvals?.filter((approval) =>
          [ApprovalState.APPROVAL_PENDING, ApprovalState.APPROVAL_DONE].includes(approval.state)
        );
        if (this.showViewApproverModal) {
          this.approvals.sort((a, b) => a.approver_order - b.approver_order);
          this.setupApproverToShow(report);
        }
        return report;
      }),
      shareReplay(1)
    );
    this.eou$ = from(this.authService.getEou());

    this.eou$.subscribe((eou) => (this.eou = eou));

    this.report$.pipe(take(1)).subscribe((report) => {
      this.reportCurrencySymbol = getCurrencySymbol(report?.currency, 'wide');

      //For sent back reports, show the comments section instead of expenses when opening the report
      if (report?.state === 'APPROVER_INQUIRY') {
        this.segmentValue = ReportPageSegment.COMMENTS;
      }
    });

    this.expenses$ = this.loadReportTxns$.pipe(
      tap(() => (this.isExpensesLoading = true)),
      switchMap(() =>
        this.expensesService.getReportExpenses(this.reportId).pipe(finalize(() => (this.isExpensesLoading = false)))
      ),
      shareReplay(1)
    );

    const permissions$: Observable<ReportPermissions> = this.spenderReportsService
      .permissions(this.reportId)
      .pipe(shareReplay(1));

    this.canEdit$ = permissions$.pipe(map((permissions) => permissions.can_edit));

    this.canDelete$ = permissions$.pipe(map((permissions) => permissions.can_delete));
    this.canResubmitReport$ = permissions$.pipe(map((permissions) => permissions.can_resubmit));

    this.expenses$.subscribe((expenses) => (this.reportExpenseIds = expenses.map((expense) => expense.id)));

    const queryParams = {
      report_id: 'is.null',
      state: 'in.(COMPLETE)',
      order: 'spent_at.desc',
      or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
    };

    this.orgSettingsService
      .get()
      .pipe(
        map(
          (orgSetting) =>
            orgSetting &&
            orgSetting.corporate_credit_card_settings?.enabled &&
            orgSetting.pending_cct_expense_restriction?.enabled
        ),
        switchMap((filterPendingTxn: boolean) =>
          this.expensesService.getAllExpenses({ queryParams }).pipe(
            map((expenses) => {
              if (filterPendingTxn) {
                return expenses.filter((expense) => {
                  if (filterPendingTxn && expense.matched_corporate_card_transaction_ids.length > 0) {
                    return expense.matched_corporate_card_transactions[0].status !== ExpenseTransactionStatus.PENDING;
                  } else {
                    return true;
                  }
                });
              }
              return expenses;
            })
          )
        ),
        map((expenses) => cloneDeep(expenses)),
        map((expenses: Expense[]) => {
          this.unreportedExpenses = expenses;
        })
      )
      .subscribe(noop);

    const orgSettings$ = this.orgSettingsService.get();
    this.simplifyReportsSettings$ = orgSettings$.pipe(
      map((orgSettings) => ({ enabled: this.getSimplifyReportSettings(orgSettings) }))
    );

    forkJoin([orgSettings$, this.launchDarklyService.getVariation('show_multi_stage_approval_flow', false)]).subscribe(
      ([orgSettings, showViewApproverModal]) => {
        this.showViewApproverModal =
          showViewApproverModal &&
          orgSettings?.simplified_multi_stage_approvals?.allowed &&
          orgSettings?.simplified_multi_stage_approvals?.enabled;
      }
    );

    this.hardwareBackButtonAction = this.platformHandlerService.registerBackButtonAction(
      BackButtonActionPriority.MEDIUM,
      () => {
        this.router.navigate(['/', 'enterprise', 'my_reports']);
      }
    );
  }

  trackReportNameChange(): void {
    this.reportNameChangeEndTime = new Date().getTime();
    this.timeSpentOnEditingReportName = (this.reportNameChangeEndTime - this.reportNameChangeStartTime) / 1000;
    this.trackingService.reportNameChange({
      Time_spent: this.timeSpentOnEditingReportName,
      Roles: this.eou?.ou.roles,
    });
  }

  async openViewApproverModal(): Promise<void> {
    const viewApproversModal = await this.popoverController.create({
      component: ShowAllApproversPopoverComponent,
      componentProps: {
        approvals: this.approvals,
      },
      cssClass: 'fy-dialog-popover',
      backdropDismiss: false,
    });

    await viewApproversModal.present();
    await viewApproversModal.onWillDismiss();

    this.trackingService.eventTrack('All approvers modal closed', { view: ExpenseView.team });
  }

  showReportNameChangeSuccessToast(): void {
    const message = 'Report name changed successfully.';
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', { message }),
      panelClass: ['msb-success'],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  updateReportName(reportName: string): void {
    this.report$
      .pipe(
        take(1),
        switchMap((report) => {
          report.purpose = reportName;
          return this.reportService.updateReportPurpose(report);
        })
      )
      .subscribe(() => {
        this.loadReportDetails$.next();
        this.showReportNameChangeSuccessToast();
        this.trackReportNameChange();
      });
  }

  editReportName(): void {
    this.reportNameChangeStartTime = new Date().getTime();
    this.report$
      .pipe(take(1))
      .pipe(
        switchMap((report) => {
          const editReportNamePopover = this.popoverController.create({
            component: EditReportNamePopoverComponent,
            componentProps: {
              reportName: report.purpose,
            },
            cssClass: 'fy-dialog-popover',
          });
          return editReportNamePopover;
        }),
        tap((editReportNamePopover) => editReportNamePopover.present()),
        switchMap(
          (editReportNamePopover) => editReportNamePopover.onWillDismiss() as Promise<{ data: { reportName: string } }>
        )
      )
      .subscribe((editReportNamePopoverDetails) => {
        const newReportName =
          editReportNamePopoverDetails &&
          editReportNamePopoverDetails.data &&
          editReportNamePopoverDetails.data.reportName;
        if (newReportName) {
          this.updateReportName(newReportName);
        }
      });
  }

  deleteReport(): void {
    this.report$.pipe(take(1)).subscribe((res) => this.deleteReportPopup(res));
  }

  getDeleteReportPopupParams(report: Report): {
    component: typeof FyDeleteDialogComponent;
    cssClass: string;
    backdropDismiss: boolean;
    componentProps: {
      header: string;
      body: string;
      infoMessage: string;
      deleteMethod: () => Observable<void>;
    };
  } {
    return {
      component: FyDeleteDialogComponent,
      cssClass: 'pop-up-in-center',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Report',
        body: 'Are you sure you want to delete this report?',
        infoMessage:
          report.state === ReportState.DRAFT && report.num_expenses === 0
            ? null
            : 'Deleting the report will not delete any of the expenses.',
        deleteMethod: (): Observable<void> =>
          this.spenderReportsService.delete(this.reportId).pipe(tap(() => this.trackingService.deleteReport())),
      },
    };
  }

  async deleteReportPopup(report: Report): Promise<void> {
    const deleteReportPopover = await this.popoverController.create(this.getDeleteReportPopupParams(report));

    await deleteReportPopover.present();

    const { data } = (await deleteReportPopover.onDidDismiss()) as { data: { status: string } };

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  resubmitReport(): void {
    this.submitReportLoader = true;
    this.spenderReportsService
      .resubmit(this.reportId)
      .pipe(finalize(() => (this.submitReportLoader = false)))
      .subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_reports']);
        const message = `Report resubmitted successfully.`;
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success-with-camera-icon'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      });
  }

  submitReport(): void {
    this.submitReportLoader = true;
    this.spenderReportsService
      .submit(this.reportId)
      .pipe(finalize(() => (this.submitReportLoader = false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/', 'enterprise', 'my_reports']);
          const message = `Report submitted successfully.`;
          this.matSnackBar.openFromComponent(ToastMessageComponent, {
            ...this.snackbarProperties.setSnackbarProperties('success', { message }),
            panelClass: ['msb-success-with-camera-icon'],
          });
          this.trackingService.showToastMessage({ ToastContent: message });
        },
        error: (error) => {
          // Capture error with additional details in Sentry
          Sentry.captureException(error, {
            extra: {
              reportId: this.reportId,
              errorResponse: error,
            },
          });
        },
      });
  }

  getTransactionRoute(category: string, canEdit: boolean): string {
    let route = '';

    if (category === 'mileage') {
      route = '/enterprise/view_mileage';
      if (canEdit) {
        route = '/enterprise/add_edit_mileage';
      }
    } else if (category === 'per diem') {
      route = '/enterprise/view_per_diem';
      if (canEdit) {
        route = '/enterprise/add_edit_per_diem';
      }
    } else {
      route = '/enterprise/view_expense';
      if (canEdit) {
        route = '/enterprise/add_edit_expense';
      }
    }

    return route;
  }

  goToTransaction({ expense, expenseIndex }: { expense: Expense; expenseIndex: number }): void {
    this.canEdit$.subscribe((canEdit) => {
      let category: string;

      if (expense.category) {
        category = expense.category.name && expense.category.name.toLowerCase();
      }

      const route = this.getTransactionRoute(category, canEdit);

      if (canEdit) {
        this.report$.pipe(take(1)).subscribe((report) =>
          this.router.navigate([
            route,
            {
              id: expense.id,
              navigate_back: true,
              remove_from_report: report.num_expenses > 1,
            },
          ])
        );
      } else {
        this.trackingService.viewExpenseClicked({ view: ExpenseView.individual, category });
        this.router.navigate([
          route,
          {
            id: expense.id,
            txnIds: JSON.stringify(this.reportExpenseIds),
            activeIndex: expenseIndex,
            view: ExpenseView.individual,
          },
        ]);
      }
    });
  }

  async shareReport(): Promise<void> {
    this.trackingService.clickShareReport();

    const shareReportModal = await this.modalController.create({
      component: ShareReportComponent,
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
      cssClass: 'share-report-modal',
    });

    await shareReportModal.present();

    const { data } = (await shareReportModal.onWillDismiss()) as { data: { email: string } };

    if (data && data.email) {
      this.spenderReportsService.export(this.reportId, data.email).subscribe(() => {
        const message = `PDF download link has been emailed to ${data.email}`;
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success-with-report-btn'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      });
    }
  }

  async openViewReportInfoModal(): Promise<void> {
    const viewInfoModal = await this.modalController.create({
      component: FyViewReportInfoComponent,
      componentProps: {
        report$: this.report$,
        expenses$: this.expenses$,
        view: ExpenseView.individual,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await viewInfoModal.present();
    await viewInfoModal.onWillDismiss();

    this.trackingService.clickViewReportInfo({ view: ExpenseView.individual });
  }

  segmentChanged(event: SegmentCustomEvent): void {
    if (event?.detail?.value) {
      this.segmentValue = parseInt(`${event.detail.value}`, 10);
    }
  }

  addComment(): void {
    if (this.newComment) {
      const comment = this.newComment;

      this.newComment = null;
      this.commentInput.nativeElement.focus();
      this.isCommentAdded = true;

      this.spenderReportsService
        .postComment(this.reportId, comment)
        .pipe()
        .subscribe(() => {
          this.loadReportDetails$.next();
          setTimeout(() => {
            this.content.scrollToBottom(500);
          }, 500);
        });
    }
  }

  addExpense(): void {
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { rp_id: this.reportId }]);
  }

  showAddExpensesToReportModal(): void {
    const addExpensesToReportModal = this.modalController.create({
      component: AddExpensesToReportComponent,
      componentProps: {
        unreportedExpenses: this.unreportedExpenses,
        reportId: this.reportId,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    from(addExpensesToReportModal)
      .pipe(
        tap((addExpensesToReportModal) => addExpensesToReportModal.present()),
        switchMap(
          (addExpensesToReportModal) =>
            addExpensesToReportModal.onWillDismiss() as Promise<{ data: { selectedExpenseIds: string[] } }>
        )
      )
      .subscribe((addExpensesToReportModalDetails) => {
        const selectedExpenseIds = addExpensesToReportModalDetails?.data?.selectedExpenseIds;
        if (selectedExpenseIds?.length > 0) {
          this.addExpensesToReport(selectedExpenseIds);
        }
      });
  }

  addExpensesToReport(selectedExpenseIds: string[]): void {
    this.isExpensesLoading = true;
    this.spenderReportsService.addExpenses(this.reportId, selectedExpenseIds).subscribe(() => {
      this.loadReportDetails$.next();
      this.loadReportTxns$.next();
      this.trackingService.addToExistingReport();
      this.unreportedExpenses = this.unreportedExpenses.filter(
        (unreportedExpense) => !selectedExpenseIds.includes(unreportedExpense.id)
      );
    });
  }
}
