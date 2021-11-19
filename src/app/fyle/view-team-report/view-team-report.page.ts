import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Observable, from, noop, Subject, concat } from 'rxjs';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from 'src/app/core/services/report.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopoverController, ModalController, IonContent } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { switchMap, finalize, map, shareReplay, tap, startWith, take, takeUntil } from 'rxjs/operators';
import { ShareReportComponent } from './share-report/share-report.component';
import { PopupService } from 'src/app/core/services/popup.service';
import { ApproveReportComponent } from './approve-report/approve-report.component';
import { NetworkService } from '../../core/services/network.service';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { TrackingService } from '../../core/services/tracking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { getCurrencySymbol } from '@angular/common';
import * as moment from 'moment';
import { StatusService } from 'src/app/core/services/status.service';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';

@Component({
  selector: 'app-view-team-report',
  templateUrl: './view-team-report.page.html',
  styleUrls: ['./view-team-report.page.scss'],
})
export class ViewTeamReportPage implements OnInit {
  @ViewChild('commentInput') commentInput: ElementRef;

  @ViewChild(IonContent, { static: false }) content: IonContent;

  erpt$: Observable<ExtendedReport>;

  etxns$: Observable<Expense[]>;

  sharedWith$: Observable<any[]>;

  reportApprovals$: Observable<any>;

  refreshApprovals$ = new Subject();

  tripRequest$: Observable<ExtendedTripRequest>;

  actions$: Observable<any>;

  hideAllExpenses = true;

  sharedWithLimit = 3;

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

  estatuses$: Observable<ExtendedStatus[]>;

  refreshEstatuses$: Subject<void> = new Subject();

  systemComments: ExtendedStatus[];

  type: string;

  systemEstatuses: ExtendedStatus[];

  userComments: any;

  totalCommentsCount$: Observable<number>;

  newComment: string;

  objectType = 'reports';

  objectId = this.activatedRoute.snapshot.params.id;

  isCommentAdded: boolean;

  etxnAmountSum$: Observable<any>;

  reportEtxnIds: string[];

  isExpensesLoading: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
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
    private snackbarProperties: SnackbarPropertiesService,
    private statusService: StatusService
  ) {}

  ngOnInit() {
    this.erpt$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.reportService.getReport(this.activatedRoute.snapshot.params.id)),
      finalize(() => from(this.loaderService.hideLoader()))
    );
    const eou$ = from(this.authService.getEou());

    this.estatuses$ = this.refreshEstatuses$.pipe(
      startWith(0),
      switchMap(() => eou$),
      switchMap((eou) =>
        this.statusService.find(this.objectType, this.objectId).pipe(
          map((estatus) =>
            estatus.map((status) => {
              status.isBotComment = status && ['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1;
              status.isSelfComment = status && eou && eou.ou && status.st_org_user_id === eou.ou.id;
              status.isOthersComment = status && eou && eou.ou && status.st_org_user_id !== eou.ou.id;
              return status;
            })
          ),
          map((res) => res.sort((a, b) => a.st_created_at.valueOf() - b.st_created_at.valueOf()))
        )
      )
    );

    this.estatuses$.subscribe((estatuses) => {
      const reversalStatus = estatuses.filter(
        (status) => status.st_comment.indexOf('created') > -1 && status.st_comment.indexOf('reversal') > -1
      );

      this.systemComments = estatuses.filter((status) => ['SYSTEM', 'POLICY'].indexOf(status.st_org_user_id) > -1);

      this.type =
        this.objectType.toLowerCase() === 'transactions'
          ? 'Expense'
          : this.objectType.substring(0, this.objectType.length - 1);

      this.systemEstatuses = this.statusService.createStatusMap(this.systemComments, this.type);

      this.userComments = estatuses.filter((status) => status.us_full_name);

      for (let i = 0; i < this.userComments.length; i++) {
        const prevCommentDt = moment(this.userComments[i - 1] && this.userComments[i - 1].st_created_at);
        const currentCommentDt = moment(this.userComments[i] && this.userComments[i].st_created_at);
        if (moment(prevCommentDt).isSame(currentCommentDt, 'day')) {
          this.userComments[i].show_dt = false;
        } else {
          this.userComments[i].show_dt = true;
        }
      }
    });

    this.totalCommentsCount$ = this.estatuses$.pipe(
      map((res) => res.filter((estatus) => estatus.st_org_user_id !== 'SYSTEM').length)
    );
  }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  setupNetworkWatcher() {
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

  getVendorName(etxn) {
    const category = etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    let vendorName = etxn.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = etxn.tx_distance;
      vendorName += ' ' + etxn.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = etxn.tx_num_days;
      vendorName += ' Days';
    }

    return vendorName;
  }

  getApproverEmails(reportApprovals) {
    return reportApprovals.map((approver) => approver.approver_email);
  }

  getShowViolation(etxn) {
    return (
      etxn.tx_id &&
      (etxn.tx_manual_flag || etxn.tx_policy_flag) &&
      !(typeof etxn.tx_policy_amount === 'number' && etxn.tx_policy_amount < 0.0001)
    );
  }

  ionViewWillEnter() {
    this.isExpensesLoading = true;
    this.setupNetworkWatcher();

    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back;

    this.erpt$ = this.refreshApprovals$.pipe(
      switchMap(() =>
        from(this.loaderService.showLoader()).pipe(
          switchMap(() => this.reportService.getTeamReport(this.activatedRoute.snapshot.params.id))
        )
      ),
      shareReplay(1),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    this.erpt$.subscribe((res) => {
      this.reportCurrencySymbol = getCurrencySymbol(res.rp_currency, 'wide');
      this.reportName = res.rp_purpose;
      /**
       * if current user is remove from approver, erpt call will go again to fetch current report details
       * so checking if report details are available in erpt than continue execution
       * else redirect them to team reports
       */
      if (res) {
        this.isReportReported = ['APPROVER_PENDING'].indexOf(res.rp_state) > -1;
      } else {
        this.router.navigate(['/', 'enterprise', 'team_reports']);
      }
    });

    this.sharedWith$ = this.reportService.getExports(this.activatedRoute.snapshot.params.id).pipe(
      map((pdfExports) =>
        pdfExports.results
          .sort((a, b) => (a.created_at < b.created_at ? 1 : b.created_at < a.created_at ? -1 : 0))
          .map((pdfExport) => pdfExport.sent_to)
          .filter((item, index, inputArray) => inputArray.indexOf(item) === index)
      )
    );

    this.reportApprovals$ = this.refreshApprovals$.pipe(
      startWith(true),
      switchMap(() => this.reportService.getApproversByReportId(this.activatedRoute.snapshot.params.id)),
      map((reportApprovals) =>
        reportApprovals
          .filter((approval) => ['APPROVAL_PENDING', 'APPROVAL_DONE'].indexOf(approval.state) > -1)
          .map((approval) => approval)
      )
    );

    this.etxns$ = from(this.authService.getEou()).pipe(
      switchMap((eou) => this.reportService.getReportETxnc(this.activatedRoute.snapshot.params.id, eou.ou.id)),
      map((etxns) =>
        etxns.map((etxn) => {
          etxn.vendor = this.getVendorName(etxn);
          etxn.violation = this.getShowViolation(etxn);
          return etxn;
        })
      ),
      shareReplay(1),
      finalize(() => (this.isExpensesLoading = false))
    );

    this.etxnAmountSum$ = this.etxns$.pipe(map((etxns) => etxns.reduce((acc, curr) => acc + curr.tx_amount, 0)));

    this.actions$ = this.reportService.actions(this.activatedRoute.snapshot.params.id).pipe(shareReplay(1));

    this.canEdit$ = this.actions$.pipe(map((actions) => actions.can_edit));
    this.canDelete$ = this.actions$.pipe(map((actions) => actions.can_delete));
    this.canResubmitReport$ = this.actions$.pipe(map((actions) => actions.can_resubmit));

    this.etxns$.subscribe((etxns) => (this.reportEtxnIds = etxns.map((etxn) => etxn.tx_id)));
    this.refreshApprovals$.next();
  }

  async deleteReport() {
    const popupResult = await this.popupService.showPopup({
      header: 'Delete Report',
      message: `
        <p class="highlight-info">
          On deleting this report, all the associated expenses will be moved to <strong>My Expenses</strong> list.
        </p>
        <p>
          Are you sure, you want to delete this report?
        </p>
      `,
      primaryCta: {
        text: 'Delete Report',
      },
    });

    if (popupResult === 'primary') {
      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() => this.reportService.delete(this.activatedRoute.snapshot.params.id)),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'team_reports']);
        });
    }
  }

  async approveReport() {
    const erpt = await this.erpt$.pipe(take(1)).toPromise();
    const etxns = await this.etxns$.toPromise();

    const popover = await this.popoverController.create({
      componentProps: {
        erpt,
        etxns,
      },
      component: ApproveReportComponent,
      cssClass: 'dialog-popover',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'team_reports']);
    }
  }

  onUpdateApprover(message: boolean) {
    if (message) {
      this.refreshApprovals$.next();
    }
  }

  goToTransaction({ etxn, etxnIndex }) {
    const category = etxn && etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    if (category === 'activity') {
      return this.popupService.showPopup({
        header: 'Cannot View Activity',
        message: 'Viewing activity is not supported in mobile app.',
        primaryCta: {
          text: 'Cancel',
        },
      });
    }

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
      { id: etxn.tx_id, txnIds: JSON.stringify(this.reportEtxnIds), activeIndex: etxnIndex, view: ExpenseView.team },
    ]);
  }

  async shareReport(event) {
    const popover = await this.popoverController.create({
      component: ShareReportComponent,
      cssClass: 'dialog-popover',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data.email) {
      const params = {
        report_ids: [this.activatedRoute.snapshot.params.id],
        email: data.email,
      };
      this.reportService.downloadSummaryPdfUrl(params).subscribe(async () => {
        const message = `We will send ${data.email} a link to download the PDF <br> when it is generated and send you a copy.`;
        await this.loaderService.showLoader(message);
      });
    }
  }

  async sendBack() {
    const popover = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title: 'Send Back',
        formLabel: 'Reason for sending back',
      },
      cssClass: 'fy-dialog-popover',
    });

    await popover.present();
    const { data } = await popover.onWillDismiss();

    if (data && data.comment) {
      const status = {
        comment: data.comment,
      };
      const statusPayload = {
        status,
        notify: false,
      };

      this.reportService.inquire(this.activatedRoute.snapshot.params.id, statusPayload).subscribe(() => {
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

  async openViewReportInfoModal() {
    const viewInfoModal = await this.modalController.create({
      component: FyViewReportInfoComponent,
      componentProps: {
        erpt$: this.erpt$,
        etxns$: this.etxns$,
        view: ExpenseView.team,
      },
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await viewInfoModal.present();
    await viewInfoModal.onWillDismiss();

    this.trackingService.clickViewReportInfo({ view: ExpenseView.team });
  }

  segmentChanged(event) {
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

  addComment() {
    if (this.newComment) {
      const data = {
        comment: this.newComment,
      };

      this.newComment = null;
      this.commentInput.nativeElement.focus();
      this.isCommentAdded = true;

      this.statusService.post(this.objectType, this.objectId, data).subscribe((res) => {
        this.refreshEstatuses$.next();
        setTimeout(() => {
          this.content.scrollToBottom(500);
        }, 500);
      });
    }
  }
}
