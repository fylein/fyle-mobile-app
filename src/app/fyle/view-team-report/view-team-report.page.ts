import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { Observable, from, Subject, concat, forkJoin, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from 'src/app/core/services/report.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopoverController, ModalController, IonContent } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { switchMap, finalize, map, shareReplay, tap, take, takeUntil, filter } from 'rxjs/operators';
import { PopupService } from 'src/app/core/services/popup.service';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { getCurrencySymbol } from '@angular/common';
import * as dayjs from 'dayjs';
import { StatusService } from 'src/app/core/services/status.service';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { ExactCurrencyPipe } from 'src/app/shared/pipes/exact-currency.pipe';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { EditReportNamePopoverComponent } from '../my-view-report/edit-report-name-popover/edit-report-name-popover.component';
import { ExpensesService } from 'src/app/core/services/platform/v1/approver/expenses.service';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { ReportPermissions } from 'src/app/core/models/report-permissions.model';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { ExtendedComment } from 'src/app/core/models/platform/v1/extended-comment.model';
import { Comment } from 'src/app/core/models/platform/v1/comment.model';
import { ReportApprovals } from 'src/app/core/models/platform/report-approvals.model';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { ShowAllApproversPopoverComponent } from 'src/app/shared/components/fy-approver/show-all-approvers-popover/show-all-approvers-popover.component';
import { ApprovalState } from 'src/app/core/models/platform/approval-state.enum';
import { DateWithTimezonePipe } from 'src/app/shared/pipes/date-with-timezone.pipe';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';

@Component({
  selector: 'app-view-team-report',
  templateUrl: './view-team-report.page.html',
  styleUrls: ['./view-team-report.page.scss'],
})
export class ViewTeamReportPage {
  @ViewChild('commentInput') commentInput: ElementRef;

  @ViewChild(IonContent, { static: false }) content: IonContent;

  report$: Observable<Report>;

  expenses$: Observable<Expense[]>;

  refreshApprovals$ = new Subject();

  permissions$: Observable<ReportPermissions>;

  hideAllExpenses = true;

  canEdit$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  canResubmitReport$: Observable<boolean>;

  isReportReported: boolean;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  reportCurrencySymbol = '';

  reportName: string;

  navigateBack = false;

  isCommentsView = false;

  isHistoryView = false;

  isExpensesView = true;

  estatuses: ExtendedComment[];

  systemComments: ExtendedComment[];

  type: string;

  systemEstatuses: ExtendedStatus[];

  userComments: ExtendedComment[];

  totalCommentsCount: number;

  newComment: string;

  objectType = 'reports';

  objectId = this.activatedRoute.snapshot.params.id as string;

  isCommentAdded: boolean;

  expensesAmountSum$: Observable<number>;

  reportExpensesIds: string[];

  isExpensesLoading: boolean;

  isSequentialApprovalEnabled = false;

  canApprove = true;

  eou$: Observable<ExtendedOrgUser>;

  canShowTooltip = false;



  loadReportDetails$ = new BehaviorSubject<void>(null);

  eou: ExtendedOrgUser;

  reportNameChangeStartTime: number;

  reportNameChangeEndTime: number;

  timeSpentOnEditingReportName: number;

  approvals: ReportApprovals[];

  approveReportLoader = false;

  showViewApproverModal = false;

  approverToShow: ReportApprovals;

  approvalAmount: number;

  showApprovalInfoMessage = false;

  approvalInfoMessage = '';

  canApproveReport = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private expensesService: ExpensesService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router,
    private popoverController: PopoverController,
    private popupService: PopupService,
    private networkService: NetworkService,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private launchDarklyService: LaunchDarklyService,
    private refinerService: RefinerService,
    private snackbarProperties: SnackbarPropertiesService,
    private statusService: StatusService,
    private exactCurrency: ExactCurrencyPipe,
    private orgSettingsService: OrgSettingsService,
    private approverReportsService: ApproverReportsService,
    private dateWithTimezonePipe: DateWithTimezonePipe,
    private browserHandlerService: BrowserHandlerService
  ) {}

  ionViewWillLeave(): void {
    this.onPageExit.next(null);
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

  getApproverEmails(reportApprovals: ReportApprovals[]): string[] {
    return reportApprovals.map((approver) => approver.approver_user.email);
  }

  loadReports(): Observable<Report> {
    return this.loadReportDetails$.pipe(
      tap(() => this.loaderService.showLoader()),
      switchMap(() =>
        this.approverReportsService
          .getReportById(this.activatedRoute.snapshot.params.id as string)
          .pipe(finalize(() => this.loaderService.hideLoader()))
      ),
      shareReplay(1)
    );
  }

  getApprovalSettings(orgSettings: OrgSettings): boolean {
    return orgSettings?.approval_settings?.enable_sequential_approvers;
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
        st_diff: null,
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
        const prevCommentDt = this.dateWithTimezonePipe.transform(this.userComments?.[i - 1]?.created_at);
        const currentCommentDt = this.dateWithTimezonePipe.transform(this.userComments?.[i]?.created_at);
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
    this.isExpensesLoading = true;
    this.setupNetworkWatcher();

    const navigateBack = this.activatedRoute.snapshot.params?.navigate_back as string | null;
    if (navigateBack && typeof navigateBack == 'string') {
      this.navigateBack = JSON.parse(navigateBack) as boolean;
    }

    this.report$ = this.loadReports();
    this.eou$ = from(this.authService.getEou());

    this.eou$.subscribe((eou) => (this.eou = eou));



    this.report$ = this.refreshApprovals$.pipe(
      switchMap(() =>
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => this.approverReportsService.getReportById(this.activatedRoute.snapshot.params.id as string)),
          map((report) => {
            this.approvals = report?.approvals?.filter((approval) =>
              [ApprovalState.APPROVAL_PENDING, ApprovalState.APPROVAL_DONE].includes(approval.state)
            );
            if (this.showViewApproverModal) {
              this.approvals.sort((a, b) => a.approver_order - b.approver_order);
              this.setupApproverToShow(report);
            }
            return report;
          })
        )
      ),
      map((report) => {
        this.setupComments(report);
        return report;
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.report$.pipe(filter((report) => !!report)).subscribe((report: Report) => {
      this.reportCurrencySymbol = getCurrencySymbol(report.currency, 'wide');
      this.reportName = report.purpose;
      /**
       * if current user is remove from approver, report call will go again to fetch current report details
       * so checking if report details are available in report than continue execution
       * else redirect them to team reports
       */
      if (report) {
        this.isReportReported = ['APPROVER_PENDING'].indexOf(report.state) > -1;
      }
    });

    this.expenses$ = this.expensesService.getReportExpenses(this.activatedRoute.snapshot.params.id as string).pipe(
      shareReplay(1),
      finalize(() => (this.isExpensesLoading = false))
    );

    this.expensesAmountSum$ = this.expenses$.pipe(
      map((expenses) => expenses.reduce((acc, curr) => acc + curr.amount, 0))
    );

    this.permissions$ = this.approverReportsService
      .permissions(this.activatedRoute.snapshot.params.id as string)
      .pipe(shareReplay(1));

    this.canEdit$ = this.permissions$.pipe(map((permissions) => permissions.can_edit));
    this.canDelete$ = this.permissions$.pipe(map((permissions) => permissions.can_delete));
    this.canResubmitReport$ = this.permissions$.pipe(map((permissions) => permissions.can_resubmit));

    forkJoin({
      expenses: this.expenses$,
      eou: this.eou$,
      report: this.report$.pipe(take(1)),
      orgSettings: this.orgSettingsService.get(),
    }).subscribe(({ expenses, eou, report, orgSettings }) => {
      this.reportExpensesIds = expenses.map((expense) => expense.id);
      this.showViewApproverModal =
        orgSettings?.simplified_multi_stage_approvals?.allowed && orgSettings.simplified_multi_stage_approvals.enabled;
      this.isSequentialApprovalEnabled = this.getApprovalSettings(orgSettings);
      this.canApprove =
        this.isSequentialApprovalEnabled || this.showViewApproverModal
          ? report.next_approver_user_ids &&
            report.next_approver_user_ids.length > 0 &&
            report.next_approver_user_ids.includes(eou.us.id)
          : true;
      this.canShowTooltip = true;
      if (this.showViewApproverModal) {
        this.approvals.sort((a, b) => a.approver_order - b.approver_order);
        this.setupApproverToShow(report);
      }

      if (this.expensesAmountSum$) {
        this.expensesAmountSum$.pipe(take(1)).subscribe((sum) => {
          this.approvalAmount = sum;
          this.setApproverInfoMessage(expenses, report);
        });
      }
    });

    this.permissions$.subscribe((permissions) => {
      this.canApproveReport = permissions.can_approve;
    });

    this.refreshApprovals$.next(null);
  }

  toggleTooltip(): void {
    this.canShowTooltip = !this.canShowTooltip;
  }

  async approveReport(): Promise<void> {
    if (!this.canApprove) {
      this.toggleTooltip();
    } else {
      const report = await this.report$.pipe(take(1)).toPromise();
      const expenses = await this.expenses$.toPromise();

      const rpAmount = this.exactCurrency.transform({
        value: report.amount,
        currencyCode: report.currency,
        skipSymbol: false,
      });
      const flaggedExpensesCount = expenses.filter((expense) => expense.is_policy_flagged).length;
      const popover = await this.popoverController.create({
        componentProps: {
          flaggedExpensesCount,
          title: 'Approve Report',
          message: report.num_expenses + ' expenses of amount ' + rpAmount + ' will be approved',
          leftAlign: true,
          primaryCta: {
            text: 'Approve',
            action: 'approve',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        component: PopupAlertComponent,
        cssClass: 'pop-up-in-center',
      });

      await popover.present();

      const { data } = (await popover.onWillDismiss()) as { data: { action: string } };

      if (data && data.action === 'approve') {
        this.approveReportLoader = true;
        this.approverReportsService
          .approve(report.id)
          .pipe(finalize(() => (this.approveReportLoader = false)))
          .subscribe(() => {
            this.router.navigate(['/', 'enterprise', 'team_reports']);
            this.launchDarklyService.getVariation('nps_survey', false).subscribe((showNpsSurvey) => {
              if (showNpsSurvey) {
                this.refinerService.startSurvey({ actionName: 'Approve Report' });
              }
            });
          });
      }
    }
  }

  onUpdateApprover(message: boolean): void {
    if (message) {
      this.refreshApprovals$.next(null);
    }
  }

  goToTransaction({ expense, expenseIndex }: { expense: Expense; expenseIndex: number }): void {
    const category = expense.category && expense.category.name.toLowerCase();

    let route: string;
    if (category === 'mileage') {
      route = '/enterprise/view_mileage';
    } else if (category === 'per diem') {
      route = '/enterprise/view_per_diem';
    } else {
      route = '/enterprise/view_expense';
    }
    this.trackingService.viewExpenseClicked({ view: ExpenseView.team, category });
    this.router.navigate([
      route,
      {
        id: expense.id,
        txnIds: JSON.stringify(this.reportExpensesIds),
        activeIndex: expenseIndex,
        view: ExpenseView.team,
      },
    ]);
  }

  async sendBack(): Promise<void> {
    const popover = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title: 'Send Back',
        formLabel: 'Reason for sending back',
      },
      cssClass: 'fy-dialog-popover',
    });

    await popover.present();
    const { data } = (await popover.onWillDismiss()) as { data: { comment: string } };

    if (data && data.comment) {
      this.approverReportsService
        .sendBack(this.activatedRoute.snapshot.params.id as string, data.comment)
        .subscribe(() => {
          const message = 'Report Sent Back successfully';
          this.matSnackBar.openFromComponent(ToastMessageComponent, {
            ...this.snackbarProperties.setSnackbarProperties('success', { message }),
            panelClass: ['msb-success-with-camera-icon'],
          });
          this.trackingService.showToastMessage({ ToastContent: message });
        });
      this.router.navigate(['/', 'enterprise', 'team_reports']);
    }
  }

  async openViewReportInfoModal(): Promise<void> {
    const viewInfoModal = await this.modalController.create({
      component: FyViewReportInfoComponent,
      componentProps: {
        report$: this.report$,
        expenses$: this.expenses$,
        view: ExpenseView.team,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await viewInfoModal.present();
    await viewInfoModal.onWillDismiss();

    this.trackingService.clickViewReportInfo({ view: ExpenseView.team });
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

  segmentChanged(event: { detail: { value: string } }): void {
    if (event && event.detail && event.detail.value) {
      if (event.detail.value === 'expenses') {
        this.isExpensesView = true;
        this.isCommentsView = false;
        this.isHistoryView = false;
      } else if (event.detail.value === 'comments') {
        this.isCommentsView = true;
        this.isExpensesView = false;
        this.isHistoryView = false;
        setTimeout(() => {
          this.content.scrollToBottom(500);
        }, 500);
      } else if (event.detail.value === 'history') {
        this.isHistoryView = true;
        this.isCommentsView = false;
        this.isExpensesView = false;
      }
    }
  }

  addComment(): void {
    if (this.newComment) {
      const comment = this.newComment;

      this.newComment = null;
      (this.commentInput.nativeElement as HTMLElement).focus();
      this.isCommentAdded = true;

      this.approverReportsService.postComment(this.objectId, comment).subscribe(() => {
        this.refreshApprovals$.next(null);
        setTimeout(() => {
          this.content.scrollToBottom(500);
        }, 500);
      });
    }
  }

  trackReportNameChange(): void {
    this.reportNameChangeEndTime = new Date().getTime();
    this.timeSpentOnEditingReportName = (this.reportNameChangeEndTime - this.reportNameChangeStartTime) / 1000;
    this.trackingService.reportNameChange({
      Time_spent: this.timeSpentOnEditingReportName,
      Roles: this.eou && this.eou.ou.roles,
    });
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
          return this.reportService.approverUpdateReportPurpose(report);
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
        const newReportName = editReportNamePopoverDetails?.data?.reportName;
        if (newReportName) {
          this.updateReportName(newReportName);
        }
      });
  }

  setApproverInfoMessage(expenses: Expense[], report: Report): void {
    const noOfExpensesRequireApproval = expenses.length;
    const totalNoOfExpenses = report.num_expenses;
    if (noOfExpensesRequireApproval === totalNoOfExpenses) {
      this.showApprovalInfoMessage = false;
    } else {
      this.showApprovalInfoMessage = true;
      const noOfExpensesNotRequireApproval = totalNoOfExpenses - noOfExpensesRequireApproval;
      const expenseText = noOfExpensesNotRequireApproval === 1 ? 'other expense' : 'other expenses';
      this.approvalInfoMessage = `You are approving ${this.formatCurrency(
        this.approvalAmount,
        report.currency
      )} in expenses, which differs from the report total since the report also includes ${noOfExpensesNotRequireApproval} ${expenseText} (which may include credits) that don't require your approval based on your company's policies.`;
    }
  }

  async openHelpArticle(): Promise<void> {
    await this.browserHandlerService.openLinkWithToolbarColor(
      '#280a31',
      'https://help.fylehq.com/en/articles/1205138-view-and-approve-expense-reports#h_1672226e87'
    );
  }

  private formatCurrency(amount: number, currencyCode: string): string {
    return this.exactCurrency.transform({
      value: amount,
      currencyCode,
      skipSymbol: false,
    });
  }
}
