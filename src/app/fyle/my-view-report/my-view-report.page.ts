import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { Observable, from, noop, concat, Subject, iif, of, forkJoin } from 'rxjs';
import { ReportService } from 'src/app/core/services/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { map, switchMap, finalize, shareReplay, takeUntil, tap, startWith } from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopoverController, ModalController, IonContent } from '@ionic/angular';
import { PopupService } from 'src/app/core/services/popup.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ShareReportComponent } from './share-report/share-report.component';
import { ResubmitReportPopoverComponent } from './resubmit-report-popover/resubmit-report-popover.component';
import { SubmitReportPopoverComponent } from './submit-report-popover/submit-report-popover.component';
import { NetworkService } from '../../core/services/network.service';
import { TrackingService } from '../../core/services/tracking.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { getCurrencySymbol } from '@angular/common';
import { FyViewReportInfoComponent } from 'src/app/shared/components/fy-view-report-info/fy-view-report-info.component';
import { EditReportNamePopoverComponent } from './edit-report-name-popover/edit-report-name-popover.component';
import * as moment from 'moment';
import { StatusService } from 'src/app/core/services/status.service';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';
import { AddExpensesToReportComponent } from '../my-edit-report/add-expenses-to-report/add-expenses-to-report.component';
import { cloneDeep, isEqual } from 'lodash';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseView } from 'src/app/core/models/expense-view.enum';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';

@Component({
  selector: 'app-my-view-report',
  templateUrl: './my-view-report.page.html',
  styleUrls: ['./my-view-report.page.scss'],
})
export class MyViewReportPage implements OnInit {
  @ViewChild('commentInput') commentInput: ElementRef;

  @ViewChild(IonContent, { static: false }) content: IonContent;

  erpt$: Observable<ExtendedReport>;

  etxns$: Observable<Expense[]>;

  sharedWith$: Observable<any[]>;

  reportApprovals$: Observable<any>;

  tripRequest$: Observable<ExtendedTripRequest>;

  hideAllExpenses = true;

  sharedWithLimit = 3;

  canEdit$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  canResubmitReport$: Observable<boolean>;

  navigateBack = false;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  reportCurrencySymbol = '';

  reportName: string;

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

  unReportedEtxns: Expense[];

  addedExpensesIdList = [];

  deleteExpensesIdList = [];

  isReportEdited: any;

  selectedTotalAmount: any;

  selectedTotalTxns: any;

  reportEtxnIds: string[];

  isExpensesLoading: boolean;

  reportId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router,
    private popupService: PopupService,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private networkService: NetworkService,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private statusService: StatusService,
    private refinerService: RefinerService,
    private humanizeCurrency: HumanizeCurrencyPipe
  ) {}

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
          map((res) =>
            res.map((status) => {
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

  getVendorName(etxn) {
    const category = etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    let vendorName = etxn.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = etxn.tx_distance || 0;
      vendorName += ' ' + etxn.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = etxn.tx_num_days || 0;
      vendorName += ' Days';
    }

    return vendorName;
  }

  getShowViolation(etxn) {
    return (
      etxn.tx_id &&
      (etxn.tx_manual_flag || etxn.tx_policy_flag) &&
      !(typeof etxn.tx_policy_amount === 'number' && etxn.tx_policy_amount < 0.0001)
    );
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    this.isExpensesLoading = true;
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    this.erpt$.subscribe((erpt) => {
      this.reportCurrencySymbol = getCurrencySymbol(erpt.rp_currency, 'wide');
      this.reportName = erpt.rp_purpose;
      this.reportId = erpt.rp_id;
    });

    this.sharedWith$ = this.reportService.getExports(this.activatedRoute.snapshot.params.id).pipe(
      map((pdfExports) =>
        pdfExports.results
          .sort((a, b) => (a.created_at < b.created_at ? 1 : b.created_at < a.created_at ? -1 : 0))
          .map((pdfExport) => pdfExport.sent_to)
          .filter((item, index, inputArray) => inputArray.indexOf(item) === index)
      )
    );

    this.reportApprovals$ = this.reportService
      .getApproversByReportId(this.activatedRoute.snapshot.params.id)
      .pipe(map((reportApprovals) => reportApprovals));

    this.etxns$ = from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.transactionService.getAllETxnc({
          tx_org_user_id: 'eq.' + eou.ou.id,
          tx_report_id: 'eq.' + this.activatedRoute.snapshot.params.id,
          order: 'tx_txn_dt.desc,tx_id.desc',
        })
      ),
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

    const actions$ = this.reportService.actions(this.activatedRoute.snapshot.params.id).pipe(shareReplay(1));

    this.canEdit$ = actions$.pipe(map((actions) => actions.can_edit));
    this.canDelete$ = actions$.pipe(map((actions) => actions.can_delete));
    this.canResubmitReport$ = actions$.pipe(map((actions) => actions.can_resubmit));

    this.etxns$.subscribe((etxns) => (this.reportEtxnIds = etxns.map((etxn) => etxn.tx_id)));

    const queryParams = {
      tx_report_id: 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc',
      or: ['(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)'],
    };

    this.transactionService
      .getAllExpenses({ queryParams })
      .pipe(
        map((etxns) => cloneDeep(etxns)),
        map((etxns: Expense[]) => {
          etxns.forEach((etxn, i) => {
            etxn.vendorDetails = this.getVendorName(etxn);
            etxn.showDt = true;
            etxn.isSelected = false;
            if (i > 0 && etxn.tx_txn_dt === etxns[i - 1].tx_txn_dt) {
              etxn.showDt = false;
            }
          });
          this.unReportedEtxns = etxns;
        })
      )
      .subscribe(noop);
  }

  goToEditReport() {
    this.router.navigate(['/', 'enterprise', 'my_edit_report', { id: this.activatedRoute.snapshot.params.id }]);
  }

  updateReportName(erpt: ExtendedReport, reportName: string) {
    erpt.rp_purpose = reportName;
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.reportService.updateReportDetails(erpt)),
        finalize(() => this.loaderService.hideLoader()),
        shareReplay(1)
      )
      .subscribe(() => {
        this.reportName = reportName;
      });
  }

  async editReportName() {
    const erpt = await this.erpt$.toPromise();
    const editReportNamePopover = await this.popoverController.create({
      component: EditReportNamePopoverComponent,
      componentProps: {
        reportName: erpt.rp_purpose,
      },
      cssClass: 'fy-dialog-popover',
    });

    await editReportNamePopover.present();
    const { data } = await editReportNamePopover.onWillDismiss();

    if (data && data.reportName) {
      this.updateReportName(erpt, data.reportName);
    }
  }

  deleteReport() {
    this.erpt$.subscribe((res) => this.deleteReportPopup(res));
  }

  async deleteReportPopup(erpt) {
    const deleteReportPopover = await this.popoverController.create({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Report',
        body: 'Are you sure you want to delete this report?',
        infoMessage:
          erpt.rp_state === 'DRAFT' && erpt.rp_num_transactions === 0
            ? null
            : 'Deleting the report will not delete any of the expenses.',
        deleteMethod: () =>
          this.reportService
            .delete(this.activatedRoute.snapshot.params.id)
            .pipe(tap(() => this.trackingService.deleteReport())),
      },
    });

    await deleteReportPopover.present();

    const { data } = await deleteReportPopover.onDidDismiss();

    if (data && data.status === 'success') {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  async showResubmitReportSummaryPopover() {
    const erpt = await this.erpt$.toPromise();
    const etxns = await this.etxns$.toPromise();
    const rpAmount = this.humanizeCurrency.transform(erpt.rp_amount, erpt.rp_currency, 2, false);
    const showCriticalViolated = false;
    const popover = await this.popoverController.create({
      componentProps: {
        title: 'Review Report',
        message: erpt.rp_num_transactions + ' expenses of amount ' + rpAmount + ' will be resubmitted',
        erpt,
        etxns,
        showCriticalViolated,
        primaryCta: {
          text: 'Resubmit',
          action: 'submit',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel',
        },
      },
      component: PopupAlertComponentComponent,
      cssClass: 'pop-up-in-center',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data && data.action === 'submit') {
      this.reportService.resubmit(erpt.rp_id).subscribe(() => {
        this.refinerService.startSurvey({ actionName: 'Resubmit Report' });
        this.router.navigate(['/', 'enterprise', 'my_reports']);
      });
    }
  }

  async showSubmitReportSummaryPopover() {
    const erpt = await this.erpt$.toPromise();
    const etxns = await this.etxns$.toPromise();
    const popover = await this.popoverController.create({
      componentProps: {
        erpt,
        etxns,
      },
      component: SubmitReportPopoverComponent,
      cssClass: 'dialog-popover',
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data && data.goBack) {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  async goToTransaction({ etxn, etxnIndex }) {
    const erpt = await this.erpt$.toPromise();
    const canEdit = this.canEditTxn(etxn.tx_state);
    let category;

    if (etxn.tx_org_category) {
      category = etxn.tx_org_category.toLowerCase();
    }

    if (category === 'activity') {
      const action = canEdit ? 'Edit' : 'View';
      return this.popupService.showPopup({
        header: `Cannot ${action} Activity`,
        message: `${action}ing activity is not supported in mobile app.`,
        primaryCta: {
          text: 'Cancel',
        },
      });
    }

    let route: string;

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
    if (canEdit) {
      this.router.navigate([
        route,
        {
          id: etxn.tx_id,
          navigate_back: true,
          remove_from_report: erpt.rp_num_transactions > 1,
        },
      ]);
    } else {
      this.trackingService.viewExpenseClicked({ view: ExpenseView.individual, category });
      this.router.navigate([
        route,
        {
          id: etxn.tx_id,
          txnIds: JSON.stringify(this.reportEtxnIds),
          activeIndex: etxnIndex,
          view: ExpenseView.individual,
        },
      ]);
    }
  }

  async shareReport() {
    this.trackingService.clickShareReport();

    const shareReportModal = await this.modalController.create({
      component: ShareReportComponent,
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
      cssClass: 'share-report-modal',
    });

    await shareReportModal.present();

    const { data } = await shareReportModal.onWillDismiss();

    if (data && data.email) {
      const params = {
        report_ids: [this.activatedRoute.snapshot.params.id],
        email: data.email,
      };
      this.reportService.downloadSummaryPdfUrl(params).subscribe(async () => {
        const message = `PDF download link has been emailed to ${data.email}`;
        this.matSnackBar.openFromComponent(ToastMessageComponent, {
          ...this.snackbarProperties.setSnackbarProperties('success', { message }),
          panelClass: ['msb-success-with-report-btn'],
        });
        this.trackingService.showToastMessage({ ToastContent: message });
      });
    }
  }

  async openViewReportInfoModal() {
    const viewInfoModal = await this.modalController.create({
      component: FyViewReportInfoComponent,
      componentProps: {
        erpt$: this.erpt$,
        etxns$: this.etxns$,
        view: ExpenseView.individual,
      },
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await viewInfoModal.present();
    await viewInfoModal.onWillDismiss();

    this.trackingService.clickViewReportInfo({ view: ExpenseView.individual });
  }

  canEditTxn(txState) {
    return this.canEdit$ && ['DRAFT', 'DRAFT_INQUIRY', 'COMPLETE', 'APPROVER_PENDING'].indexOf(txState) > -1;
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
        if (this.userComments && this.userComments.length > 0) {
          setTimeout(() => {
            this.content.scrollToBottom(500);
          }, 500);
        }
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

      this.statusService
        .post(this.objectType, this.objectId, data)
        .pipe()
        .subscribe((res) => {
          this.refreshEstatuses$.next();
          setTimeout(() => {
            this.content.scrollToBottom(500);
          }, 500);
        });
    }
  }

  addExpense() {
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { rp_id: this.activatedRoute.snapshot.params.id }]);
  }

  checkReportEdited() {
    this.isReportEdited = this.deleteExpensesIdList.length > 0 || this.addedExpensesIdList.length > 0;
  }

  async showAddExpensesToReportModal() {
    const AddExpensesToReportModal = await this.modalController.create({
      component: AddExpensesToReportComponent,
      componentProps: {
        unReportedEtxns: this.unReportedEtxns,
      },
    });

    await AddExpensesToReportModal.present();

    const { data } = await AddExpensesToReportModal.onWillDismiss();
    if (data && data.selectedTxnIds) {
      this.addedExpensesIdList = data.selectedTxnIds;
      this.selectedTotalAmount = data.selectedTotalAmount;
      this.selectedTotalTxns = data.selectedTotalTxns;
      this.checkReportEdited();
      this.saveReport();
    }
  }

  removeTxnFromReport() {
    const removeTxnList$ = [];
    this.deleteExpensesIdList.forEach((txnId) => {
      removeTxnList$.push(this.reportService.removeTransaction(this.activatedRoute.snapshot.params.id, txnId));
    });

    return forkJoin(removeTxnList$);
  }

  saveReport() {
    const report = {
      purpose: this.reportName,
      id: this.activatedRoute.snapshot.params.id,
    };

    this.reportService
      .createDraft(report)
      .pipe(
        switchMap((res) =>
          iif(
            () => this.addedExpensesIdList.length > 0,
            this.reportService
              .addTransactions(this.activatedRoute.snapshot.params.id, this.addedExpensesIdList)
              .pipe(tap(() => this.trackingService.addToExistingReport())),
            of(false)
          )
        ),
        switchMap((res) => iif(() => this.deleteExpensesIdList.length > 0, this.removeTxnFromReport(), of(false))),
        finalize(() => {
          this.addedExpensesIdList = [];
          this.deleteExpensesIdList = [];
          this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.reportId }]);
        })
      )
      .subscribe(noop);
  }
}
